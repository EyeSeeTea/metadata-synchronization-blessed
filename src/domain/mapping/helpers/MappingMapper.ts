import _ from "lodash";
import { modelFactory } from "../../../models/dhis/factory";
import { D2Api } from "../../../types/d2-api";
import { Expression, ExpressionParser, ExpressionType } from "../../../utils/expressionParser";
import { mapCategoryOptionCombo } from "../../../utils/synchronization";
import { Ref } from "../../common/entities/Ref";
import {
    CategoryOptionCombo,
    Indicator,
    MetadataPackage,
    ProgramIndicator,
} from "../../metadata/entities/MetadataEntities";
import { cleanToModelName } from "../../metadata/utils";
import { MetadataMapping, MetadataMappingDictionary } from "../entities/MetadataMapping";

export class MappingMapper {
    private api: D2Api;

    constructor(
        private mapping: MetadataMappingDictionary,
        private originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
        private destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
    ) {
        this.api = new D2Api();
    }

    public applyMapping(payload: MetadataPackage) {
        return _.mapValues(payload, (items, model) => {
            const collectionName = modelFactory(model).getCollectionName();
            const properties = _.keyBy(
                this.api.models[collectionName]?.schema.properties,
                "fieldName"
            );

            return items?.map((object: any) => {
                if (typeof object !== "object") return object;

                const mappedObject = this.mapReference({ key: model, object });

                return _.mapValues(mappedObject, (value, key) => {
                    const { propertyType, itemPropertyType } = properties[key] ?? {};

                    if (propertyType === "REFERENCE") {
                        return this.mapReference({ parent: model, key, object: value });
                    }

                    if (itemPropertyType === "REFERENCE" && Array.isArray(value)) {
                        return value.map(item =>
                            this.mapReference({ parent: model, key, object: item })
                        );
                    }

                    if (propertyType === "COMPLEX" || itemPropertyType === "COMPLEX") {
                        return this.mapComplex(value);
                    }

                    return value;
                });
            });
        });
    }

    private mapComplex(object: any): any {
        if (Array.isArray(object)) return object.map(item => this.mapComplex(item));

        return _.mapValues(object, (value, key) => {
            if (key === "id" && typeof value === "string") {
                return this.lookup(value) ?? value;
            } else if (typeof value === "object") {
                return this.mapComplex(value);
            } else {
                return value;
            }
        });
    }

    private mapReference<T extends Ref>({
        parent,
        key,
        object,
    }: {
        parent?: string;
        key: string;
        object: T;
    }): T {
        const modelName = cleanToModelName(this.api, key, parent);
        if (!modelName) return object;

        const mappedId = this.lookup(object.id) ?? object.id;

        if (modelName === "indicators") {
            const indicator = (object as unknown) as Partial<Indicator>;
            const numerator = this.mapExpression("indicator", indicator.numerator);
            const denominator = this.mapExpression("indicator", indicator.denominator);
            return { ...object, id: mappedId, numerator, denominator };
        } else if (modelName === "programIndicators") {
            const indicator = (object as unknown) as Partial<ProgramIndicator>;
            const expression = this.mapExpression("programIndicator", indicator.expression);
            const filter = this.mapExpression("programIndicator", indicator.filter);
            return { ...object, id: mappedId, expression, filter };
        }

        return { ...object, id: mappedId };
    }

    private mapExpression(
        type: ExpressionType,
        expression: string | undefined
    ): string | undefined {
        if (!expression) return undefined;

        const config = ExpressionParser.parse(type, expression).value.data ?? [];
        const mappedConfig = config.map(expression => {
            const mappedExpression = this.transformExpression(expression);
            if (mappedExpression) return mappedExpression;

            // Best effort default lookup
            return _.mapValues(expression, (id, property) => {
                const modelName = cleanToModelName(this.api, property);
                if (!modelName || typeof id !== "string") return id;
                return this.lookup(id) ?? id;
            });
        });

        const validation = ExpressionParser.build(type, mappedConfig as Expression[]);
        if (validation.isError()) return expression;

        return validation.value.data;
    }

    private transformExpression(expression: Expression): Expression | undefined {
        switch (expression.type) {
            case "dataElement": {
                const { mappedId: dataElement, mapping: innerMapping = {} } =
                    (this.mapping["aggregatedDataElements"] &&
                        this.mapping["aggregatedDataElements"][expression.dataElement]) ??
                    {};
                if (!dataElement) return undefined;

                const categoryOptionCombo =
                    mapCategoryOptionCombo(
                        expression.categoryOptionCombo,
                        [innerMapping, this.mapping],
                        this.originCategoryOptionCombos,
                        this.destinationCategoryOptionCombos
                    ) ?? expression.categoryOptionCombo;

                const attributeOptionCombo =
                    mapCategoryOptionCombo(
                        expression.attributeOptionCombo,
                        [innerMapping, this.mapping],
                        this.originCategoryOptionCombos,
                        this.destinationCategoryOptionCombos
                    ) ?? expression.attributeOptionCombo;

                return {
                    type: "dataElement",
                    dataElement,
                    categoryOptionCombo,
                    attributeOptionCombo,
                };
            }
            case "programDataElement": {
                const { mappedId: program = expression.program } =
                    (this.mapping["eventPrograms"] &&
                        this.mapping["eventPrograms"][expression.program]) ??
                    {};

                const dataElementId = _.keys(this.mapping["programDataElements"]).find(id => {
                    const parts = id.split("-");
                    const sameProgram = _.first(parts) === expression.program;
                    const sameDataElement = _.last(parts) === expression.dataElement;
                    return sameProgram && sameDataElement;
                });

                if (!dataElementId)
                    return {
                        type: "programDataElement",
                        program,
                        dataElement: expression.dataElement,
                    };

                const { mappedId: dataElement = expression.dataElement } =
                    this.mapping["programDataElements"][dataElementId] ?? {};

                return {
                    type: "programDataElement",
                    program,
                    dataElement,
                };
            }
            default:
                return undefined;
        }
    }

    private lookup(id?: string): string | undefined {
        // We would normally use _.get(mapping, [modelName, id]) but modelName of mapping is custom
        const mappingStore: MetadataMapping[] = _.values(this.mapping)
            .map(item => _.mapValues(item, (value, id) => ({ id, ...value })))
            .flatMap(_.values);

        const { mappedId } = mappingStore.find(item => item.id === id) ?? {};
        return mappedId !== "DISABLED" ? mappedId : undefined;
    }
}
