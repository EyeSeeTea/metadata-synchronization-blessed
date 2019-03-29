import _ from "lodash";
import { cleanOptions, d2BaseModelColumns, d2BaseModelDetails } from "../utils/d2";
import { TableFilters, TableLabel, TableList, TablePagination } from "../types/d2-ui-components";
import { D2, ModelDefinition } from "../types/d2";

abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;

    // Other static properties can be optionally overridden on subclasses
    protected static columns = d2BaseModelColumns;
    protected static details = d2BaseModelDetails;
    protected static initialSorting = ["name", "asc"];

    // List method should be executed by a wrapper to preserve static context binding
    public static async listMethod(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { search = null, date = null } = filters || {};
        const { page = 1, pageSize = 20, sorting = this.initialSorting } = pagination || {};
        const fields = this.details.map(e => e.name);

        const [field, direction] = sorting;
        const order = `${field}:i${direction}`;
        const filter = _.compact([
            search ? `displayName:ilike:${search}` : null,
            date ? `lastUpdated:gt:${date.toISOString()}` : null,
        ]);

        const listOptions = cleanOptions({ fields, filter, page, pageSize, order });
        const collection = await d2.models[this.metadataType].list(listOptions);
        return { pager: collection.pager, objects: collection.toArray() };
    }

    public static getD2Model(d2: D2): ModelDefinition {
        return d2.models[this.metadataType];
    }

    public static getColumns(): TableLabel[] {
        return this.columns;
    }

    public static getDetails(): TableLabel[] {
        return this.details;
    }

    public static getInitialSorting(): string[] {
        return this.initialSorting;
    }
}

export class OrganisationUnitModel extends D2Model {
    protected static metadataType = "organisationUnit";

    public static async getOrgUnitGroups(d2: D2) {
        const fields = ["id", "displayName"];
        const groups = await d2.models.organisationUnitGroup.list({ fields });
        return _.map(groups.toArray(), g => ({ id: g.id, name: g.displayName }));
    }
}

export class DataElementModel extends D2Model {
    protected static metadataType = "dataElement";
}

export class IndicatorModel extends D2Model {
    protected static metadataType = "indicator";
}

export class ValidationRuleModel extends D2Model {
    protected static metadataType = "validationRule";
}
