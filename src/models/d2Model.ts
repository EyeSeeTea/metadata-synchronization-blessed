import _ from "lodash";
import { isValidUid } from "d2/uid";

import {
    cleanParams,
    d2BaseModelColumns,
    d2BaseModelDetails,
    organisationUnitsColumns,
    organisationUnitsDetails,
} from "../utils/d2";
import {
    OrganisationUnitTableFilters,
    TableFilters,
    TableLabel,
    TableList,
    TablePagination,
} from "../types/d2-ui-components";
import { D2, ModelDefinition } from "../types/d2";

export abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;
    protected static groupFilterName: string;
    protected static excludeRules: string[] = [];
    protected static includeRules: string[] = [];

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
        const {
            search = null,
            fields: overriddenFields = null,
            lastUpdatedDate = null,
            groupFilter = null,
            customFilters = [],
            customFields = [],
        } = filters || {};
        const { page = 1, pageSize = 20, sorting = this.initialSorting, paging = true } =
            pagination || {};

        const details = this.details.map(e => e.name);
        const columns = this.columns.map(e => e.name);
        const fields = overriddenFields
            ? overriddenFields
            : _.union(details, columns, customFields);

        const [field, direction] = sorting;
        const order = `${field}:i${direction}`;
        const filter = _.compact([
            search && isValidUid(search) ? `id:eq:${search}` : null,
            search && !isValidUid(search) ? `displayName:ilike:${search}` : null,
            lastUpdatedDate ? `lastUpdated:ge:${lastUpdatedDate.toISOString()}` : null,
            groupFilter ? `${this.groupFilterName}.id:eq:${groupFilter}` : null,
            ...customFilters,
        ]);

        const listParams = cleanParams({ fields, filter, page, pageSize, order, paging });
        const collection = await this.getD2Model(d2).list(listParams);
        return { pager: collection.pager, objects: collection.toArray() };
    }

    public static getD2Model(d2: D2): ModelDefinition {
        return d2.models[this.metadataType];
    }

    public static getMetadataType(): string {
        return this.metadataType;
    }

    public static getExcludeRules(): string[][] {
        return this.excludeRules.map(_.toPath);
    }

    public static getIncludeRules(): string[][] {
        return this.includeRules.map(_.toPath);
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
    protected static groupFilterName = "organisationUnitGroups";

    protected static excludeRules = [
        "legendSets",
        "dataSets",
        "programs",
        "user",
        "users",
        "userAccesses",
        "userGroupAccesses",
        "organisationUnitGroups.user",
        "organisationUnitGroups.userAccesses",
        "organisationUnitGroups.userGroupAccesses",
        "organisationUnitGroups.organisationUnitGroupSets.user",
        "organisationUnitGroups.organisationUnitGroupSets.userAccesses",
        "organisationUnitGroups.organisationUnitGroupSets.userGroupAccesses",
    ];
    protected static includeRules = [
        "attribute",
        "organisationUnitGroups",
        "organisationUnitGroups.attributes",
        "organisationUnitGroups.organisationUnitGroupSets",
        "organisationUnitGroups.organisationUnitGroupSets.attributes",
    ];
    protected static columns = organisationUnitsColumns;
    protected static details = organisationUnitsDetails;

    public static async listMethod(
        d2: D2,
        filters: OrganisationUnitTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { orgUnitLevel = null } = filters || {};
        const newFilters = {
            ...filters,
            customFilters: _.compact([orgUnitLevel ? `level:eq:${orgUnitLevel}` : null]),
        };
        return await super.listMethod(d2, newFilters, pagination);
    }
}

export class DataElementModel extends D2Model {
    protected static metadataType = "dataElement";
}

export class IndicatorModel extends D2Model {
    protected static metadataType = "indicator";
    protected static groupFilterName = "indicatorGroups";

    protected static excludeRules = [
        "dataSets",
        "programs",
        "indicatorGroups.indicators",
        "indicatorGroups.indicatorGroupSet.indicatorGroups",
    ];
    protected static includeRules = [
        "attributes",
        "legendSets",
        "indicatorType",
        "indicatorGroups",
        "indicatorGroups.attributes",
        "indicatorGroups.indicatorGroupSet",
    ];
}

export class ValidationRuleModel extends D2Model {
    protected static metadataType = "validationRule";
    protected static groupFilterName = "validationRuleGroups";
    protected static excludeRules = ["legendSets", "validationRuleGroups.validationRules"];
    protected static includeRules = [
        "attributes",
        "validationRuleGroups",
        "validationRuleGroups.attributes",
    ];
}

export function defaultModel(pascalCaseModelName: string): any {
    return class DefaultModel extends D2Model {
        protected static metadataType = pascalCaseModelName;
    };
}
