import _ from "lodash";
import moment from "moment";
import { DataSyncPeriod } from "../../../../domain/aggregated/types";
import { buildPeriodFromParams } from "../../../../domain/aggregated/utils";
import { Instance, PublicInstance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { Store } from "../../../../domain/stores/entities/Store";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import { SynchronizationType } from "../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../locales";
import { executeAnalytics } from "../../../../utils/analytics";
import { promiseMap } from "../../../../utils/common";
import { formatDateLong } from "../../../../utils/date";
import { availablePeriods } from "../../../../utils/synchronization";
import { CompositionRoot } from "../../../CompositionRoot";
import { AdvancedSettings, MSFSettings } from "./MSFEntities";

type LoggerFunction = (event: string, userType?: "user" | "admin") => void;

//TODO: maybe convert to class and presenter to use MVP, MVI or BLoC pattern
export async function executeAggregateData(
    compositionRoot: CompositionRoot,
    advancedSettings: AdvancedSettings,
    msfSettings: MSFSettings,
    onAddProgressMessage: (progress: string) => void,
    onValidationError: (errors: string[]) => void,
    isAdmin: boolean
): Promise<SynchronizationReport[]> {
    const addEventToProgress: LoggerFunction = (event, userType = "user") => {
        if (userType === "admin" && !isAdmin) return;
        onAddProgressMessage(event);
    };

    addEventToProgress(i18n.t(`Retrieving information from the system...`));

    const syncRules = await getSyncRules(compositionRoot, advancedSettings, msfSettings);

    const validationErrors = await validatePreviousDataValues(
        compositionRoot,
        syncRules,
        msfSettings,
        addEventToProgress
    );

    if (validationErrors.length > 0) {
        onValidationError(validationErrors);
        return [];
    }

    addEventToProgress(i18n.t(`Starting Aggregate Data...`));

    if (isGlobalInstance && msfSettings.runAnalytics === "false") {
        const lastExecution = await getLastAnalyticsExecution(compositionRoot);

        addEventToProgress(
            i18n.t("Run analytics is disabled, last analytics execution: {{lastExecution}}", {
                lastExecution,
                nsSeparator: false,
            }),
            "admin"
        );
    }
    if (msfSettings.deleteDataValuesBeforeSync) {
        addEventToProgress(
            i18n.t(
                `Deleting previous data values is not possible because data element group is not defined, please contact with your administrator`
            ),
            "admin"
        );
    }

    const runAnalyticsIsRequired =
        msfSettings.runAnalytics === "by-sync-rule-settings"
            ? syncRules.some(rule => rule.builder.dataParams?.runAnalytics ?? false)
            : msfSettings.runAnalytics === "true";

    const rulesWithoutRunAnalylics = syncRules.map(rule =>
        rule.updateBuilderDataParams({ ...rule.builder.dataParams, runAnalytics: false })
    );

    if (runAnalyticsIsRequired) {
        await runAnalytics(compositionRoot, addEventToProgress, msfSettings.analyticsYears);
    }

    const reports = await promiseMap(rulesWithoutRunAnalylics, syncRule =>
        executeSyncRule(compositionRoot, syncRule, addEventToProgress, msfSettings)
    );

    addEventToProgress(i18n.t(`Finished Aggregate Data`));

    return reports;
}

export function isGlobalInstance(): boolean {
    return !window.location.host.includes("localhost");
}

async function validatePreviousDataValues(
    compositionRoot: CompositionRoot,
    syncRules: SynchronizationRule[],
    msfSettings: MSFSettings,
    addEventToProgress: LoggerFunction
): Promise<string[]> {
    if (!msfSettings.checkInPreviousPeriods) return [];

    addEventToProgress(i18n.t(`Checking data values in previous periods ....`), "admin");

    const validationsErrors = await promiseMap(syncRules, async rule => {
        const targetInstances = await compositionRoot.instances.list({ ids: rule.targetInstances });

        const byInstance = await promiseMap(targetInstances, async instance => {
            if (!rule.dataParams || !rule.dataParams.period) {
                return undefined;
            }
            const { startDate } = buildPeriodFromParams(rule.dataParams);
            const endDate = startDate.clone().subtract(1, "day");

            const { dataValues = [] } = await compositionRoot.aggregated.list(
                instance,
                {
                    orgUnitPaths: rule.builder.dataParams?.orgUnitPaths ?? [],
                    startDate: moment("1970-01-01").toDate(),
                    endDate: endDate.toDate(),
                    lastUpdated: startDate.toDate(),
                },
                "" // TODO: Re-do Data element group
            );

            if (dataValues.length > 0) {
                const periodName = availablePeriods[rule.dataParams.period].name;

                return `Sync rule '${rule.name}': there are data values in '${
                    instance.name
                }' for previous period to '${periodName}' and updated after '${startDate.format(
                    "YYYY-MM-DD"
                )}'`;
            } else {
                return undefined;
            }
        });

        return _.compact(byInstance);
    });

    return _(validationsErrors).compact().flatten().value();
}

async function executeSyncRule(
    compositionRoot: CompositionRoot,
    rule: SynchronizationRule,
    addEventToProgress: LoggerFunction,
    msfSettings: MSFSettings
): Promise<SynchronizationReport> {
    const { name, builder, id: syncRule, type = "metadata", targetInstances } = rule;

    addEventToProgress(i18n.t(`Starting Sync Rule {{name}} ...`, { name }), "admin");

    if (msfSettings.deleteDataValuesBeforeSync) {
        await deletePreviousDataValues(
            compositionRoot,
            targetInstances,
            builder,
            addEventToProgress
        );
    }

    const sync = compositionRoot.sync[type]({ ...builder, syncRule });

    for await (const { message, syncReport, done } of sync.execute()) {
        if (message) addEventToProgress(message, "admin");
        if (syncReport) await compositionRoot.reports.save(syncReport);

        if (done && syncReport) {
            addEventToProgress(`${i18n.t("Summary of Sync Rule")}:`, "admin");
            syncReport.getResults().forEach(result => {
                addEventToProgress(
                    `${i18n.t("Type")}: ${getTypeName(result.type, syncReport.type)}`,
                    "admin"
                );

                const origin = result.origin
                    ? `${i18n.t("Origin")}: ${getOriginName(result.origin)} `
                    : "";
                const originPackage = result.originPackage
                    ? `${i18n.t("Origin package")}: ${result.originPackage.name}`
                    : "";
                const destination = `${i18n.t("Destination")}: ${result.instance.name}`;
                addEventToProgress(`${origin} ${originPackage} -> ${destination}`, "admin");

                addEventToProgress(
                    _.compact([
                        `${i18n.t("Status")}: ${_.startCase(_.toLower(result.status))}`,
                        result.message,
                    ]).join(" - "),
                    "admin"
                );

                result.errors?.forEach(error => {
                    addEventToProgress(error.message, "admin");
                });
            });

            addEventToProgress(i18n.t(`Finished Sync Rule {{name}}`, { name }));

            return syncReport;
        } else if (done) {
            addEventToProgress(i18n.t(`Finished Sync Rule {{name}} with errors`, { name }));
        }
    }

    return SynchronizationReport.create();
}

const getTypeName = (reportType: SynchronizationType, syncType: string) => {
    switch (reportType) {
        case "aggregated":
            return syncType === "events" ? i18n.t("Program Indicators") : i18n.t("Aggregated");
        case "events":
            return i18n.t("Events");
        case "metadata":
            return i18n.t("Metadata");
        case "deleted":
            return i18n.t("Deleted");
        default:
            return i18n.t("Unknown");
    }
};

async function getSyncRules(
    compositionRoot: CompositionRoot,
    advancedSettings: AdvancedSettings,
    msfSettings: MSFSettings
): Promise<SynchronizationRule[]> {
    const { period: overridePeriod } = advancedSettings;
    const { projectMinimumDates } = msfSettings;
    const { dataViewOrganisationUnits } = await compositionRoot.instances.getCurrentUser();

    const { rows } = await compositionRoot.rules.list({ paging: false });
    const allRules = await promiseMap(rows, ({ id }) => compositionRoot.rules.get(id));

    const getProjectMinimumDate = (path: string) =>
        _.find(projectMinimumDates, (_project, key) => path.includes(key))?.date;

    return _(allRules)
        .map(rule => {
            // Remove rules that are not aggregated or events
            if (!rule || !["events", "aggregated"].includes(rule.type)) return undefined;

            const paths = rule.dataSyncOrgUnitPaths.filter(path =>
                _.some(dataViewOrganisationUnits, ({ id }) => path.includes(id))
            );

            // Filter organisation units to user visibility
            return paths.length > 0 ? rule?.updateDataSyncOrgUnitPaths(paths) : undefined;
        })
        .compact()
        .map(rule => {
            // Update period and dates according to settings
            return !overridePeriod
                ? rule
                : rule.updateBuilderDataParams({
                      period: overridePeriod.period,
                      startDate: overridePeriod.startDate,
                      endDate: overridePeriod.endDate,
                  });
        })
        .map(rule => {
            const { endDate } = buildPeriodFromParams(rule.dataParams);

            // Remove org units with minimum date after end date
            return rule.updateDataSyncOrgUnitPaths(
                rule.dataSyncOrgUnitPaths.filter(path => {
                    const minDate = getProjectMinimumDate(path);
                    return !minDate || moment(minDate).isSameOrBefore(endDate);
                })
            );
        })
        .flatMap(rule => {
            const { startDate, endDate } = buildPeriodFromParams(rule.dataParams);

            return _(rule.dataSyncOrgUnitPaths)
                .groupBy(path => {
                    const minDate = getProjectMinimumDate(path);
                    return minDate ? moment(minDate).format("YYYY-MM-DD") : undefined;
                })
                .toPairs()
                .map(([date, paths]) => {
                    const minDate = moment(date);

                    // Keep original dates but update org unit paths if is before current date
                    if (date === "undefined" || minDate.isSameOrBefore(startDate)) {
                        return rule
                            .updateName(
                                `${rule.name} (${startDate.format(
                                    "DD-MM-YYYY"
                                )} to ${endDate.format("DD-MM-YYYY")})`
                            )
                            .updateDataSyncOrgUnitPaths(paths);
                    }

                    // Update start date if minimum date is after current one
                    return rule
                        .updateName(
                            `${rule.name} (${minDate.format("DD-MM-YYYY")} to ${endDate.format(
                                "DD-MM-YYYY"
                            )})`
                        )
                        .updateDataSyncOrgUnitPaths(paths)
                        .updateBuilderDataParams({
                            period: "FIXED",
                            startDate: minDate.toDate(),
                            endDate: endDate.toDate(),
                        });
                })
                .value();
        })
        .filter(rule => rule.dataSyncOrgUnitPaths.length > 0)
        .value();
}

async function runAnalytics(
    compositionRoot: CompositionRoot,
    addEventToProgress: LoggerFunction,
    lastYears: number
) {
    const localInstance = await compositionRoot.instances.getLocal();

    for await (const message of executeAnalytics(localInstance, { lastYears })) {
        addEventToProgress(message, "admin");
    }

    addEventToProgress(i18n.t("Analytics execution finished on {{name}}", localInstance), "admin");
}

async function getLastAnalyticsExecution(compositionRoot: CompositionRoot): Promise<string> {
    const systemInfo = await compositionRoot.systemInfo.get();

    return systemInfo.lastAnalyticsTableSuccess
        ? formatDateLong(systemInfo.lastAnalyticsTableSuccess)
        : i18n.t("never");
}

const getOriginName = (source: PublicInstance | Store) => {
    if ((source as Store).token) {
        const store = source as Store;
        return store.account + " - " + store.repository;
    } else {
        const instance = source as PublicInstance;
        return instance.name;
    }
};

const getPeriodText = (period: { type: DataSyncPeriod; startDate?: Date; endDate?: Date }) => {
    const formatDate = (date?: Date) => moment(date).format("YYYY-MM-DD");

    return `${availablePeriods[period.type].name} ${
        period.type === "FIXED"
            ? `- start: ${formatDate(period.startDate)} - end: ${formatDate(period.endDate)}`
            : ""
    }`;
};

async function deletePreviousDataValues(
    compositionRoot: CompositionRoot,
    targetInstances: string[],
    builder: SynchronizationBuilder,
    addEventToProgress: LoggerFunction
) {
    for (const instanceId of targetInstances) {
        const instanceResult = await compositionRoot.instances.getById(instanceId);

        instanceResult.match({
            error: () =>
                addEventToProgress(
                    i18n.t(`Error retrieving instance {{name}} to delete previoud data values`, {
                        name: instanceId,
                    }),
                    "admin"
                ),
            success: async instance => {
                const periodType = builder.dataParams?.period;

                if (!periodType) {
                    addEventToProgress(
                        i18n.t(
                            `Deleting previous data values for period {{period}} is not possible`,
                            { period: getPeriodText({ type: "ALL" }) }
                        ),
                        "admin"
                    );
                    return;
                }

                addEventToProgress(
                    i18n.t(
                        `Deleting previous data values in target instance {{name}} for period {{period}}...`,
                        { name: instance.name, period: getPeriodText({ type: periodType }) }
                    ),
                    "admin"
                );

                const dataElements = await getRuleDataElements(compositionRoot, builder, instance);

                const sync = compositionRoot.sync.aggregated({
                    originInstance: builder.originInstance,
                    targetInstances: builder.targetInstances,
                    metadataIds: dataElements,
                    excludedIds: [],
                    dataParams: {
                        period: periodType,
                        startDate: builder.dataParams?.startDate,
                        endDate: builder.dataParams?.endDate,
                        orgUnitPaths: builder.dataParams?.orgUnitPaths,
                        allAttributeCategoryOptions: true,
                    },
                });

                const payload = await sync.buildPayload();
                const mappedPayload = await sync.mapPayload(instance, payload);
                await compositionRoot.aggregated.delete(instance, mappedPayload);
            },
        });
    }
}

async function getRuleDataElements(
    compositionRoot: CompositionRoot,
    builder: SynchronizationBuilder,
    instance: Instance
): Promise<string[]> {
    const sync = compositionRoot.sync.aggregated(builder);
    const payload = await sync.buildPayload();
    const mappedPayload = await sync.mapPayload(instance, payload);
    return _.compact(mappedPayload.dataValues?.map(({ dataElement }) => dataElement));
}
