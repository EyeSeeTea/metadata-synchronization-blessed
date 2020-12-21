import _ from "lodash";
import moment from "moment";
import { Period } from "../../../../domain/common/entities/Period";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { SynchronizationBuilder } from "../../../../domain/synchronization/entities/SynchronizationBuilder";
import i18n from "../../../../locales";
import { executeAnalytics } from "../../../../utils/analytics";
import { promiseMap } from "../../../../utils/common";
import { formatDateLong } from "../../../../utils/date";
import { availablePeriods } from "../../../../utils/synchronization";
import { CompositionRoot } from "../../../CompositionRoot";
import { AdvancedSettings } from "../../../react/msf-aggregate-data/components/advanced-settings-dialog/AdvancedSettingsDialog";
import { MSFSettings } from "../../../react/msf-aggregate-data/components/msf-settings-dialog/MSFSettingsDialog";

//TODO: maybe convert to class and presenter to use MVP, MVI or BLoC pattern
//TODO: maybe create MSF AggregateData use case?
export async function executeAggregateData(
    compositionRoot: CompositionRoot,
    advancedSettings: AdvancedSettings,
    msfSettings: MSFSettings,
    onProgressChange: (progress: string[]) => void
) {
    let syncProgress: string[] = [i18n.t(`Starting Aggregate Data...`)];

    onProgressChange(syncProgress);

    const onSyncRuleProgressChange = (event: string) => {
        const lastEvent = syncProgress[syncProgress.length - 1];

        if (lastEvent !== event) {
            syncProgress = [...syncProgress, event];
            onProgressChange(syncProgress);
        }
    };

    if (isGlobalInstance && msfSettings.runAnalytics === false) {
        const lastExecution = await getLastAnalyticsExecution(compositionRoot);

        onSyncRuleProgressChange(
            i18n.t("Run analytics is disabled, last analytics execution: {{lastExecution}}", {
                lastExecution,
                nsSeparator: false,
            })
        );
    }

    if (advancedSettings.deleteDataValuesBeforeSync && !msfSettings.dataElementGroupId) {
        onSyncRuleProgressChange(
            i18n.t(
                `Deleting previous data values is not possible because data element group is not defined, please contact with your administrator`
            )
        );
    }

    const eventSyncRules = await getSyncRules(compositionRoot);

    const runAnalyticsIsRequired =
        msfSettings.runAnalytics === "by-sync-rule-settings"
            ? eventSyncRules.some(rule => rule.builder.dataParams?.runAnalytics ?? false)
            : msfSettings.runAnalytics;

    const rulesWithoutRunAnalylics = eventSyncRules.map(rule =>
        rule.updateBuilderDataParams({ ...rule.builder.dataParams, runAnalytics: false })
    );

    if (runAnalyticsIsRequired) {
        await runAnalytics(compositionRoot, onSyncRuleProgressChange);
    }

    for (const syncRule of rulesWithoutRunAnalylics) {
        await executeSyncRule(
            compositionRoot,
            syncRule,
            onSyncRuleProgressChange,
            advancedSettings,
            msfSettings
        );
    }

    onProgressChange([...syncProgress, i18n.t(`Finished Aggregate Data`)]);
}

export function isGlobalInstance(): boolean {
    return !window.location.host.includes("localhost");
}

async function executeSyncRule(
    compositionRoot: CompositionRoot,
    rule: SynchronizationRule,
    onProgressChange: (event: string) => void,
    advancedSettings: AdvancedSettings,
    msfSettings: MSFSettings
): Promise<void> {
    const { name, builder, id: syncRule, type = "metadata", targetInstances } = rule;

    const newBuilder = advancedSettings.period
        ? {
              ...builder,
              dataParams: {
                  ...builder.dataParams,
                  period: advancedSettings.period.type,
                  startDate: advancedSettings.period.startDate,
                  endDate: advancedSettings.period.endDate,
              },
          }
        : builder;

    onProgressChange(i18n.t(`Starting Sync Rule {{name}} ...`, { name }));

    if (advancedSettings.deleteDataValuesBeforeSync && msfSettings.dataElementGroupId) {
        await deletePreviousDataValues(
            compositionRoot,
            targetInstances,
            newBuilder,
            msfSettings,
            onProgressChange
        );
    }

    const sync = compositionRoot.sync[type]({ ...newBuilder, syncRule });

    for await (const { message, syncReport, done } of sync.execute()) {
        if (message) onProgressChange(message);
        if (syncReport) await compositionRoot.reports.save(syncReport);

        if (done && syncReport) {
            onProgressChange(i18n.t(`Finished Sync Rule {{name}}`, { name }));
        } else if (done) {
            onProgressChange(i18n.t(`Finished Sync Rule {{name}} with errors`, { name }));
        }
    }
}

async function getSyncRules(compositionRoot: CompositionRoot): Promise<SynchronizationRule[]> {
    const rulesList = (
        await compositionRoot.rules.list({ filters: { type: "events" }, paging: false })
    ).rows.slice(0, 2);

    const rules = await promiseMap(rulesList, rule => {
        return compositionRoot.rules.get(rule.id);
    });

    return _.compact(rules);
}

async function runAnalytics(
    compositionRoot: CompositionRoot,
    onProgressChange: (event: string) => void
) {
    const localInstance = await compositionRoot.instances.getLocal();

    for await (const message of executeAnalytics(localInstance)) {
        onProgressChange(message);
    }

    onProgressChange(i18n.t("Analytics execution finished on {{name}}", localInstance));
}

async function getLastAnalyticsExecution(compositionRoot: CompositionRoot): Promise<string> {
    const systemInfo = await compositionRoot.systemInfo.get();

    return systemInfo.lastAnalyticsTableSuccess
        ? formatDateLong(systemInfo.lastAnalyticsTableSuccess)
        : i18n.t("never");
}

async function deletePreviousDataValues(
    compositionRoot: CompositionRoot,
    targetInstances: string[],
    newBuilder: SynchronizationBuilder,
    msfSettings: MSFSettings,
    onProgressChange: (event: string) => void
) {
    const getPeriodText = (period: Period) => {
        const formatDate = (date?: Date) => moment(date).format("YYYY-MM-DD");

        return `${availablePeriods[period.type].name} ${
            period.type === "FIXED"
                ? `- start: ${formatDate(period.startDate)} - end: ${formatDate(period.endDate)}`
                : ""
        }`;
    };

    for (const instanceId of targetInstances) {
        const instanceResult = await compositionRoot.instances.getById(instanceId);

        instanceResult.match({
            error: () =>
                onProgressChange(
                    i18n.t(`Error retrieving instance {{name}} to delete previoud data values`, {
                        name: instanceId,
                    })
                ),
            success: instance => {
                if (newBuilder.dataParams?.period) {
                    const periodResult = Period.create({
                        type: newBuilder.dataParams.period,
                        startDate: newBuilder.dataParams.startDate,
                        endDate: newBuilder.dataParams.endDate,
                    });

                    periodResult.match({
                        error: () => onProgressChange(i18n.t(`Error creating period`)),
                        success: period => {
                            if (msfSettings.dataElementGroupId) {
                                const periodText = getPeriodText(period);

                                onProgressChange(
                                    i18n.t(
                                        `Deleting previous data values in target instance {{name}} for period {{period}}...`,
                                        { name: instance.name, period: periodText }
                                    )
                                );

                                compositionRoot.aggregated.delete(
                                    newBuilder.dataParams?.orgUnitPaths ?? [],
                                    msfSettings.dataElementGroupId,
                                    period,
                                    instance
                                );
                            }
                        },
                    });
                }
            },
        });
    }
}
