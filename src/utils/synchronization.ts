import FileSaver from "file-saver";
import _ from "lodash";
import moment from "moment";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../domain/mapping/entities/MetadataMapping";
import { CategoryOptionCombo } from "../domain/metadata/entities/MetadataEntities";
import i18n from "../locales";
import SyncRule from "../models/syncRule";
import { D2Api } from "../types/d2-api";
import { buildObject } from "../types/utils";
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

export const availablePeriods = buildObject<{
    name: string;
    start?: [number, string];
    end?: [number, string];
}>()({
    ALL: { name: i18n.t("All time") },
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
});

export type PeriodType = keyof typeof availablePeriods;

export function requestJSONDownload(payload: object, syncRule: SyncRule) {
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
    originCategoryOptionCombos: Partial<CategoryOptionCombo>[],
    destinationCategoryOptionCombos: Partial<CategoryOptionCombo>[]
): string | undefined => {
    if (!optionCombo) return undefined;
    for (const mapping of mappings) {
        const { categoryOptions = {}, categoryCombos = {} } = mapping;
        const origin = _.find(originCategoryOptionCombos, ["id", optionCombo]);
        const isDisabled = _.some(
            origin?.categoryOptions?.map(({ id }) =>
                _.keys(categoryOptions).find(candidate => _.last(candidate.split("-")) === id)
            ),
            { mappedId: "DISABLED" }
        );

        // Candidates built from equal category options
        const candidates = destinationCategoryOptionCombos.filter(o =>
            _.isEqual(
                _.sortBy(o.categoryOptions, ["id"]),
                _.sortBy(
                    origin?.categoryOptions?.map(({ id }) => {
                        const nestedId = _.keys(categoryOptions).find(
                            candidate => _.last(candidate.split("-")) === id
                        );

                        return nestedId
                            ? {
                                  id: categoryOptions[nestedId]?.mappedId,
                              }
                            : undefined;
                    }),
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
        const candidate = _(options).values().find(["code", value]);

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
