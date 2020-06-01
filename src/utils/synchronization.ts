import i18n from "@dhis2/d2-i18n";
import FileSaver from "file-saver";
import _ from "lodash";
import moment from "moment";
import memoize from "nano-memoize";
import { SyncronizationClass } from "../domain/synchronization/usecases/GenericSyncUseCase";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../models/instance";
import SyncRule from "../models/syncRule";
import { D2, DataImportResponse } from "../types/d2";
import { D2Api, D2CategoryOptionCombo } from "../types/d2-api";
import { SyncRuleType } from "../types/synchronization";
import {
    SynchronizationResult,
    SynchronizationStats,
} from "../domain/synchronization/entities/SynchronizationResult";
import "../utils/lodash-mixins";

//TODO: when all request to metadata using metadataRepository.getMetadataByIds
// this function should be removed
export async function getMetadata(
    api: D2Api,
    elements: string[],
    fields = ":all"
): Promise<Record<string, any[]>> {
    const promises = [];
    for (let i = 0; i < elements.length; i += 100) {
        const requestElements = elements.slice(i, i + 100).toString();
        promises.push(
            api
                .get("/metadata", {
                    fields,
                    filter: "id:in:[" + requestElements + "]",
                    defaults: "EXCLUDE",
                })
                .getData()
        );
    }
    const response = await Promise.all(promises);
    const results = _.deepMerge({}, ...response);
    if (results.system) delete results.system;
    return results;
}

export function cleanDataImportResponse(
    importResult: DataImportResponse,
    instance: Instance,
    type: SyncRuleType
): SynchronizationResult {
    const { status: importStatus, message, importCount, response, conflicts } = importResult;
    const status = importStatus === "OK" ? "SUCCESS" : importStatus;
    const aggregatedMessages = conflicts?.map(({ object, value }) => ({
        id: object,
        message: value,
    }));

    const eventsMessages = _.flatten(
        response?.importSummaries?.map(
            ({ reference = "", description = "", conflicts }) =>
                conflicts?.map(({ object, value }) => ({
                    id: reference,
                    message: _([description, object, value])
                        .compact()
                        .join(" "),
                })) ?? { id: reference, message: description }
        )
    );

    const stats: SynchronizationStats = {
        created: importCount?.imported ?? response?.imported ?? 0,
        deleted: importCount?.deleted ?? response?.deleted ?? 0,
        updated: importCount?.updated ?? response?.updated ?? 0,
        ignored: importCount?.ignored ?? response?.ignored ?? 0,
        total: 0,
    };

    return {
        status,
        message,
        stats,
        instance: instance.toObject(),
        errors: aggregatedMessages ?? eventsMessages ?? [],
        date: new Date(),
        type,
    };
}

export const availablePeriods: {
    [id: string]: {
        name: string;
        start?: [number, string];
        end?: [number, string];
    };
} = {
    ALL: { name: i18n.t("All periods") },
    FIXED: { name: i18n.t("Fixed period") },
    TODAY: { name: i18n.t("Today"), start: [0, "day"] },
    YESTERDAY: { name: i18n.t("Yesterday"), start: [1, "day"] },
    LAST_7_DAYS: { name: i18n.t("Last 7 days"), start: [7, "day"], end: [0, "day"] },
    LAST_14_DAYS: { name: i18n.t("Last 14 days"), start: [14, "day"], end: [0, "day"] },
    THIS_WEEK: { name: i18n.t("This week"), start: [0, "isoWeek"] },
    LAST_WEEK: { name: i18n.t("Last week"), start: [1, "isoWeek"] },
    THIS_MONTH: { name: i18n.t("This month"), start: [0, "month"] },
    LAST_MONTH: { name: i18n.t("Last month"), start: [1, "month"] },
    THIS_QUARTER: { name: i18n.t("This quarter"), start: [0, "quarter"] },
    LAST_QUARTER: { name: i18n.t("Last quarter"), start: [1, "quarter"] },
    THIS_YEAR: { name: i18n.t("This year"), start: [0, "year"] },
    LAST_YEAR: { name: i18n.t("Last year"), start: [1, "year"] },
    LAST_FIVE_YEARS: { name: i18n.t("Last 5 years"), start: [5, "year"], end: [1, "year"] },
};

// TODO: when all request to metadata using metadataRepository.getModelByType
// this function should be removed
export const getCategoryOptionCombos = memoize(
    async (api: D2Api) => {
        const { objects } = await api.models.categoryOptionCombos
            .get({
                paging: false,
                fields: {
                    id: true,
                    name: true,
                    categoryCombo: true,
                    categoryOptions: true,
                },
            })
            .getData();

        return objects;
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

export async function requestJSONDownload(
    SyncClass: SyncronizationClass,
    syncRule: SyncRule,
    d2: D2,
    api: D2Api
) {
    const sync = new SyncClass(d2, api, syncRule.toBuilder());
    const payload = await sync.buildPayload();

    const json = JSON.stringify(payload, null, 4);
    const blob = new Blob([json], { type: "application/json" });
    const ruleName = _.kebabCase(_.toLower(syncRule.name));
    const date = moment().format("YYYYMMDDHHmm");
    const fileName = `${ruleName}-${syncRule.type}-sync-${date}.json`;
    FileSaver.saveAs(blob, fileName);
}

export const mapCategoryOptionCombo = (
    optionCombo: string | undefined,
    mappings: MetadataMappingDictionary[],
    originCategoryOptionCombos: Partial<D2CategoryOptionCombo>[],
    destinationCategoryOptionCombos: Partial<D2CategoryOptionCombo>[]
): string | undefined => {
    if (!optionCombo) return undefined;
    for (const mapping of mappings) {
        const { categoryOptions = {}, categoryCombos = {} } = mapping;
        const origin = _.find(originCategoryOptionCombos, ["id", optionCombo]);
        const isDisabled = _.some(
            origin?.categoryOptions?.map(({ id }) => categoryOptions[id]),
            { mappedId: "DISABLED" }
        );

        // Candidates built from equal category options
        const candidates = _.filter(destinationCategoryOptionCombos, o =>
            _.isEqual(
                _.sortBy(o.categoryOptions, ["id"]),
                _.sortBy(
                    origin?.categoryOptions?.map(({ id }) => ({
                        id: categoryOptions[id]?.mappedId,
                    })),
                    ["id"]
                )
            )
        );

        // Exact object built from equal category options and combo
        const exactObject = _.find(candidates, o =>
            _.isEqual(o.categoryCombo, {
                id:
                    categoryCombos[origin?.categoryCombo?.id ?? ""]?.mappedId ??
                    origin?.categoryCombo?.id,
            })
        );

        // If there's only one candidate, ignore the category combo, else provide exact object
        const candidate = candidates.length === 1 ? _.first(candidates) : exactObject;
        const defaultValue = isDisabled ? "DISABLED" : undefined;
        const result = candidate?.id ?? defaultValue;
        if (result) return result;
    }

    return optionCombo;
};

export const mapOptionValue = (
    value: string | undefined,
    mappings: MetadataMappingDictionary[]
): string => {
    for (const mapping of mappings) {
        const { options } = mapping;
        const candidate = _(options)
            .values()
            .find(["code", value]);

        if (candidate?.mappedCode) return candidate?.mappedCode;
    }

    return value ?? "";
};

export const mapProgramDataElement = (
    program: string,
    programStage: string,
    dataElement: string,
    mapping: MetadataMappingDictionary
): MetadataMapping => {
    const { programDataElements = {} } = mapping;
    const complexId = `${program}-${programStage}-${dataElement}`;
    const candidate = programDataElements[complexId]?.mappedId
        ? programDataElements[complexId]
        : programDataElements[dataElement];

    return candidate ?? {};
};
