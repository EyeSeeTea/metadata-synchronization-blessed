import i18n from "@dhis2/d2-i18n";
import { Button, LinearProgress, makeStyles } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
import { ConfirmationDialog, useLoading, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { AggregatedSync } from "../../../logic/sync/aggregated";
import { EventsSync } from "../../../logic/sync/events";
import { MetadataSync } from "../../../logic/sync/metadata";
import {
    availablePeriods,
    cleanOrgUnitPaths,
    getMetadata,
    requestJSONDownload,
} from "../../../utils/synchronization";
import { getValidationMessages } from "../../../utils/validations";
import { aggregationItems } from "../data/AggregationStep";
import includeExcludeRulesFriendlyNames from "../metadata/RulesFriendlyNames";
import { getInstanceOptions } from "./InstanceSelectionStep";
// import Instance from "../../../models/instance";

const LiEntry = ({ label, value, children }) => {
    return (
        <li key={label}>
            {label}
            {value || children ? ": " : ""}
            {value}
            {children}
        </li>
    );
};

const useStyles = makeStyles({
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
    },
});

const config = {
    metadata: {
        SyncClass: MetadataSync,
    },
    aggregated: {
        SyncClass: AggregatedSync,
    },
    events: {
        SyncClass: EventsSync,
    },
};

const SaveStep = ({ syncRule, onCancel }) => {
    const d2 = useD2();
    const api = useD2Api();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const classes = useStyles();
    const history = useHistory();

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [metadata, updateMetadata] = useState({});
    const [instanceOptions, setInstanceOptions] = useState([]);
    //const [targetInstances, setTargetInstances] = useState([]);

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const name = syncRule.isOnDemand()
        ? `Rule generated on ${moment().format("YYYY-MM-DD HH:mm:ss")}`
        : syncRule.name;

    const save = async () => {
        setIsSaving(true);

        const errors = await getValidationMessages(api, syncRule);
        if (errors.length > 0) {
            snackbar.error(errors.join("\n"));
        } else {
            const newSyncRule = await syncRule.updateName(name).save(api);
            history.push(`/sync-rules/${newSyncRule.type}/edit/${newSyncRule.id}`);
            onCancel();
        }

        setIsSaving(false);
    };

    const downloadJSON = async () => {
        const { SyncClass } = config[syncRule.type];

        loading.show(true, "Generating JSON file");
        requestJSONDownload(SyncClass, syncRule, d2, api);
        loading.reset();
    };

    useEffect(() => {
        const ids = [
            ...syncRule.metadataIds,
            ...syncRule.excludedIds,
            ...syncRule.dataSyncAttributeCategoryOptions,
            ...cleanOrgUnitPaths(syncRule.dataSyncOrgUnitPaths),
        ];
        getMetadata(api, ids, "id,name").then(updateMetadata);
        getInstanceOptions(api).then(setInstanceOptions);
    }, [api, syncRule]);

    // useEffect(() => {
    //     const getTargetInstances = async d2 =>
    //         _.compact(await Promise.all(syncRule.targetInstances.map(id => Instance.get(d2, id))));

    //     getTargetInstances(d2).then(setTargetInstances);
    // }, [d2, syncRule]);

    // const renderMetadataMapping = instanceId => {
    //     return (
    //         <LiEntry label={i18n.t("Metadata mapping")}>
    //             <ul>
    //                 {targetInstances.length > 0
    //                     ? Object.entries(
    //                           targetInstances.find(instance => instance.id === instanceId)
    //                               .metadataMapping
    //                       ).map(([modelKey, value]) => (
    //                           <LiEntry key={modelKey} label={modelKey}>
    //                               <ul>
    //                                   {Object.entries(value)
    //                                       .filter(([key, value]) => {
    //                                           //TODO: currently we only are filtering metadata mapping by existed models in metadada of sync rule
    //                                           // (example: organisationUnits) we are not filtering metadata mapping by metadata related to data (aggregate, events)
    //                                           // for example by dataElements, CategoryOption, this filter will be realize on the future in other issue.
    //                                           // Then is possibble we need to use here other metadata array varibale to use for filters.
    //                                           return (
    //                                               !metadata[modelKey] ||
    //                                               metadata[modelKey].some(
    //                                                   metadataItem => metadataItem.id === key
    //                                               )
    //                                           );
    //                                       })
    //                                       .map(([key, value]) => (
    //                                           <LiEntry
    //                                               key={key}
    //                                               label={`${i18n.t("Source")} ${key}`}
    //                                               value={`${i18n.t("Target")} ${value.mappedId}`}
    //                                           />
    //                                       ))}
    //                               </ul>
    //                           </LiEntry>
    //                       ))
    //                     : null}
    //             </ul>
    //         </LiEntry>
    //     );
    // };

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={cancelDialogOpen}
                onSave={onCancel}
                onCancel={closeCancelDialog}
                title={i18n.t("Cancel synchronization rule wizard")}
                description={i18n.t(
                    "You are about to exit the Sync Rule Creation Wizard. All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
            />

            <ul>
                <LiEntry label={i18n.t("Name")} value={name} />

                <LiEntry label={i18n.t("Code")} value={syncRule.code} />

                <LiEntry label={i18n.t("Description")} value={syncRule.description} />

                <LiEntry
                    label={i18n.t("Target instances [{{total}}]", {
                        total: syncRule.targetInstances.length,
                    })}
                >
                    <ul>
                        {syncRule.targetInstances.map(id => {
                            const instanceOption = instanceOptions.find(e => e.value === id);
                            return instanceOption ? (
                                <LiEntry key={instanceOption.value} label={instanceOption.text}>
                                    {/* {syncRule.type !== "metadata" && (
                                        <ul>{renderMetadataMapping(id)}</ul>
                                    )}  */}
                                </LiEntry>
                            ) : null;
                        })}
                    </ul>
                </LiEntry>

                {_.keys(metadata).map(metadataType => {
                    const items = metadata[metadataType].filter(
                        ({ id }) => !syncRule.excludedIds.includes(id)
                    );
                    return (
                        items.length > 0 && (
                            <LiEntry
                                key={metadataType}
                                label={`${d2.models[metadataType].displayName} [${items.length}]`}
                            >
                                <ul>
                                    {items.map(({ id, name }) => (
                                        <LiEntry key={id} label={`${name} (${id})`} />
                                    ))}
                                </ul>
                            </LiEntry>
                        )
                    );
                })}

                {syncRule.excludedIds.length > 0 && (
                    <LiEntry
                        label={`${i18n.t("Excluded elements")} [${syncRule.excludedIds.length}]`}
                    >
                        <ul>
                            {syncRule.excludedIds.map(id => {
                                const element = _(metadata)
                                    .values()
                                    .flatten()
                                    .find({ id });

                                return (
                                    <LiEntry
                                        key={id}
                                        label={element ? `${element.name} (${id})` : id}
                                    />
                                );
                            })}
                        </ul>
                    </LiEntry>
                )}
                {syncRule.type === "metadata" && (
                    <LiEntry
                        label={i18n.t("Use default include exclude configuration")}
                        value={
                            syncRule.useDefaultIncludeExclude
                                ? i18n.t("Enabled")
                                : i18n.t("Disabled")
                        }
                    />
                )}

                {syncRule.type === "metadata" && !syncRule.useDefaultIncludeExclude && (
                    <LiEntry label={i18n.t("Include exclude configuration")}>
                        <ul>
                            {_.keys(syncRule.metadataIncludeExcludeRules).map(key => (
                                <LiEntry key={key} label={key}>
                                    <ul>
                                        <LiEntry label={i18n.t("Include rules")} />
                                        <ul>
                                            {syncRule.metadataIncludeExcludeRules[
                                                key
                                            ].includeRules.map(includeRule => (
                                                <ul>
                                                    <LiEntry
                                                        label={
                                                            includeExcludeRulesFriendlyNames[
                                                                includeRule
                                                            ] || includeRule
                                                        }
                                                    />
                                                </ul>
                                            ))}
                                        </ul>
                                        <LiEntry label={i18n.t("Exclude rules")} />
                                        <ul>
                                            {syncRule.metadataIncludeExcludeRules[
                                                key
                                            ].excludeRules.map(excludeRule => (
                                                <ul>
                                                    <LiEntry
                                                        label={
                                                            includeExcludeRulesFriendlyNames[
                                                                excludeRule
                                                            ] || excludeRule
                                                        }
                                                    />
                                                </ul>
                                            ))}
                                        </ul>
                                    </ul>
                                </LiEntry>
                            ))}
                        </ul>
                    </LiEntry>
                )}

                {syncRule.type === "events" && (
                    <LiEntry
                        label={i18n.t("Events")}
                        value={
                            syncRule.dataSyncAllEvents
                                ? i18n.t("All events")
                                : i18n.t("{{total}} selected events", {
                                      total: syncRule.dataSyncEvents.length,
                                  })
                        }
                    />
                )}

                {syncRule.dataSyncAllAttributeCategoryOptions && (
                    <LiEntry
                        label={i18n.t("Category Option Combo")}
                        value={i18n.t("All attribute category options")}
                    />
                )}

                {syncRule.type !== "metadata" && (
                    <LiEntry
                        label={i18n.t("Period")}
                        value={availablePeriods[syncRule.dataSyncPeriod]?.name}
                    >
                        {syncRule.dataSyncPeriod === "FIXED" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("Start date")}
                                    value={moment(syncRule.dataSyncStartDate).format("YYYY-MM-DD")}
                                />
                            </ul>
                        )}
                        {syncRule.dataSyncPeriod === "FIXED" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("End date")}
                                    value={moment(syncRule.dataSyncEndDate).format("YYYY-MM-DD")}
                                />
                            </ul>
                        )}
                    </LiEntry>
                )}

                {syncRule.type !== "metadata" && (
                    <LiEntry
                        label={i18n.t("Aggregation")}
                        value={
                            syncRule.dataSyncEnableAggregation
                                ? i18n.t(
                                      _.find(aggregationItems, [
                                          "id",
                                          syncRule.dataSyncAggregationType,
                                      ])?.name ?? i18n.t("Enabled")
                                  )
                                : i18n.t("Disabled")
                        }
                    />
                )}

                {syncRule.type === "metadata" && (
                    <LiEntry label={i18n.t("Advanced options")}>
                        <ul>
                            <LiEntry
                                label={i18n.t("Strategy")}
                                value={
                                    syncRule.syncParams.importStrategy === "CREATE_AND_UPDATE"
                                        ? i18n.t("Create and update")
                                        : syncRule.syncParams.importStrategy === "CREATE"
                                        ? i18n.t("Create")
                                        : syncRule.syncParams.importStrategy === "UPDATE"
                                        ? i18n.t("Update")
                                        : ""
                                }
                            />
                        </ul>
                        <ul>
                            <LiEntry
                                label={i18n.t("Include user information and sharing settings")}
                                value={
                                    syncRule.syncParams.includeSharingSettings
                                        ? i18n.t("Yes")
                                        : i18n.t("No")
                                }
                            />
                        </ul>
                        <ul>
                            <LiEntry
                                label={i18n.t("Disable atomic verification")}
                                value={
                                    syncRule.syncParams.atomicMode === "NONE"
                                        ? i18n.t("Yes")
                                        : i18n.t("No")
                                }
                            />
                        </ul>
                        <ul>
                            <LiEntry
                                label={i18n.t("Replace objects in destination instance")}
                                value={
                                    syncRule.syncParams.mergeMode === "REPLACE"
                                        ? i18n.t("Yes")
                                        : i18n.t("No")
                                }
                            />
                        </ul>
                        <ul>
                            <LiEntry
                                label={i18n.t("Dry run")}
                                value={
                                    syncRule.syncParams.importMode === "VALIDATE"
                                        ? i18n.t("Yes")
                                        : i18n.t("No")
                                }
                            />
                        </ul>
                    </LiEntry>
                )}
                {(syncRule.type === "events" || syncRule.type === "aggregated") && (
                    <LiEntry label={i18n.t("Advanced options")}>
                        {syncRule.type === "aggregated" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("Strategy")}
                                    value={
                                        syncRule.dataParams.strategy === "NEW_AND_UPDATES"
                                            ? i18n.t("New and updates")
                                            : syncRule.dataParams.strategy === "NEW"
                                            ? i18n.t("New")
                                            : syncRule.dataParams.strategy === "UPDATES"
                                            ? i18n.t("Updates")
                                            : ""
                                    }
                                />
                            </ul>
                        )}
                        {syncRule.type === "events" && (
                            <ul>
                                <LiEntry
                                    label={i18n.t("Generate new UID")}
                                    value={
                                        syncRule.dataParams.generateNewUid
                                            ? i18n.t("Yes")
                                            : i18n.t("No")
                                    }
                                />
                            </ul>
                        )}
                        <ul>
                            <LiEntry
                                label={i18n.t("Dry run")}
                                value={syncRule.dataParams.dryRun ? i18n.t("Yes") : i18n.t("No")}
                            />
                        </ul>
                    </LiEntry>
                )}

                <LiEntry
                    label={i18n.t("Scheduling")}
                    value={syncRule.enabled ? i18n.t("Enabled") : i18n.t("Disabled")}
                />

                {syncRule.longFrequency && (
                    <LiEntry label={i18n.t("Frequency")} value={syncRule.longFrequency} />
                )}
            </ul>

            <div className={classes.buttonContainer}>
                <div>
                    {!syncRule.isOnDemand() && (
                        <Button onClick={openCancelDialog} variant="contained">
                            {i18n.t("Cancel")}
                        </Button>
                    )}
                    <Button className={classes.saveButton} onClick={save} variant="contained">
                        {syncRule.isOnDemand() ? i18n.t("Save as sync Rule") : i18n.t("Save")}
                    </Button>
                </div>
                <div>
                    <Button onClick={downloadJSON} variant="contained">
                        {i18n.t("Download JSON")}
                    </Button>
                </div>
            </div>

            {isSaving && <LinearProgress />}
        </React.Fragment>
    );
};

export default SaveStep;
