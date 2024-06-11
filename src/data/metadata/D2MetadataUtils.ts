import _ from "lodash";
import { Id } from "../../domain/common/entities/Schemas";
import { DataElement, DataSet, Program } from "../../domain/metadata/entities/MetadataEntities";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";

export class D2MetadataUtils {
    static async excludeDefaults(metadata: GenericMetadata, defaultIds: Id[]) {
        // In DHIS 2.38.5 and above the defaults parameter is not working
        // /api/metadata.json?fields=id,categoryCombo&filter=id:eq:data_element_id&defaults=INCLUDE/EXCLUDE; this is not working
        // so manually removing the default categoryCombo
        const result = _(metadata)
            .mapValues(elements => {
                return elements.map(element => this.excludeDefaultsFromModels(element, defaultIds));
            })
            .value();
        return result;
    }

    @cache()
    static async getDefaultIds(api: D2Api, filter?: string): Promise<string[]> {
        const response = (await api
            .get("/metadata", {
                filter: "identifiable:eq:default",
                fields: "id",
            })
            .getData()) as {
            [key: string]: { id: string }[];
        };

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    }

    private static excludeDefaultsFromModels(fixedElement: MetadataDefaultCategoryCombo, defaultIds: Id[]) {
        return fixedElement.categoryCombo && defaultIds.includes(fixedElement.categoryCombo.id)
            ? _(fixedElement).omit("categoryCombo").value()
            : fixedElement;
    }
}

type GenericMetadata = { dataElements: DataElement[]; dataSets: DataSet[]; programs: Program[] };
type MetadataDefaultCategoryCombo = DataElement | DataSet | Program;
