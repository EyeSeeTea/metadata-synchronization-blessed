import SyncIcon from "@material-ui/icons/Sync";
import { ConfirmationDialog, ConfirmationDialogProps, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Ref } from "../../../../../domain/common/entities/Ref";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import { Store } from "../../../../../domain/stores/entities/Store";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import { D2Model } from "../../../../../models/dhis/default";
import { metadataModels } from "../../../../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    DataSetWithDataElementsModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    EventProgramWithProgramStagesModel,
    IndicatorMappedModel,
    ProgramIndicatorMappedModel,
} from "../../../../../models/dhis/mapping";
import { DataElementGroupModel, DataElementGroupSetModel } from "../../../../../models/dhis/metadata";
import { MetadataType } from "../../../../../utils/d2";
import { isAppConfigurator } from "../../../../../utils/permissions";
import DeletedObjectsTable from "../../../../react/core/components/delete-objects-table/DeletedObjectsTable";
import { InstanceSelectionOption } from "../../../../react/core/components/instance-selection-dropdown/InstanceSelectionDropdown";
import MetadataTable from "../../../../react/core/components/metadata-table/MetadataTable";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import {
    PullRequestCreation,
    PullRequestCreationDialog,
} from "../../../../react/core/components/pull-request-creation-dialog/PullRequestCreationDialog";
import SyncDialog from "../../../../react/core/components/sync-dialog/SyncDialog";
import SyncSummary from "../../../../react/core/components/sync-summary/SyncSummary";
import { TestWrapper } from "../../../../react/core/components/test-wrapper/TestWrapper";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import InstancesSelectors from "./InstancesSelectors";

const config: Record<
    SynchronizationType,
    {
        title: string;
        models: typeof D2Model[];
        childrenKeys: string[] | undefined;
    }
> = {
    metadata: {
        title: i18n.t("Metadata Synchronization"),
        models: metadataModels,
        childrenKeys: undefined,
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization"),
        models: [
            DataSetWithDataElementsModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            IndicatorMappedModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
    },
    events: {
        title: i18n.t("Events Synchronization"),
        models: [
            EventProgramWithDataElementsModel,
            EventProgramWithProgramStagesModel,
            EventProgramWithIndicatorsModel,
            ProgramIndicatorMappedModel,
        ],
        childrenKeys: ["dataElements", "programIndicators", "stages"],
    },
    deleted: {
        title: i18n.t("Deleted Objects Synchronization"),
        models: [],
        childrenKeys: undefined,
    },
};

const ManualSyncPage: React.FC = () => {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { api, compositionRoot } = useAppContext();
    const history = useHistory();
    const { type } = useParams() as { type: SynchronizationType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SynchronizationRule>(SynchronizationRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SynchronizationReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [sourceInstance, setSourceInstance] = useState<Instance>();
    const [destinationInstance, setDestinationInstanceBase] = useState<Ref>();
    const [pullRequestProps, setPullRequestProps] = useState<PullRequestCreation>();
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const updateSyncRuleFromDialog = useCallback((newSyncRule: SynchronizationRule) => {
        const id = newSyncRule.targetInstances[0];
        setDestinationInstanceBase(id ? { id } : undefined);
        updateSyncRule(newSyncRule);
    }, []);

    const setDestinationInstance = useCallback((destinationInstance: Ref | undefined) => {
        const newTargetInstances = _.compact([destinationInstance?.id || "LOCAL"]);
        updateSyncRule(syncRule => syncRule.updateTargetInstances(newTargetInstances));
        setDestinationInstanceBase(destinationInstance);
    }, []);

    useEffect(() => {
        setDestinationInstance(undefined);
    }, [sourceInstance, setDestinationInstance]);

    useEffect(() => {
        isAppConfigurator(api).then(updateAppConfigurator);
    }, [api, updateAppConfigurator]);

    const goBack = () => history.push("/dashboard");

    const updateSelection = useCallback(
        (selection: string[], exclusion: string[]) => {
            updateSyncRule(({ originInstance, targetInstances }) =>
                SynchronizationRule.createOnDemand(type)
                    .updateBuilder({ originInstance })
                    .updateTargetInstances(targetInstances)
                    .updateMetadataIds(selection)
                    .updateExcludedIds(exclusion)
            );
        },
        [type]
    );

    const openSynchronizationDialog = () => {
        if (syncRule.metadataIds.length > 0) {
            setSyncDialogOpen(true);
        } else {
            snackbar.error(i18n.t("Please select at least one element from the table to synchronize"));
        }
    };

    const finishSynchronization = (importResponse?: SynchronizationReport) => {
        setSyncDialogOpen(false);

        if (importResponse) {
            setSyncReport(importResponse);
        } else {
            snackbar.error(i18n.t("Unknown error with the request"));
        }
    };

    const closeDialogs = () => {
        setSyncDialogOpen(false);
    };

    const handleSynchronization = async (syncRule: SynchronizationRule) => {
        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        try {
            const result = await compositionRoot.sync.prepare(syncRule.type, syncRule.toBuilder());
            const sync = compositionRoot.sync[syncRule.type](syncRule.toBuilder());

            const createPullRequest = () => {
                if (!sourceInstance) {
                    snackbar.error(i18n.t("Unable to create pull request"));
                } else {
                    setPullRequestProps({
                        instance: sourceInstance,
                        builder: syncRule.toBuilder(),
                        type: syncRule.type,
                    });
                }
            };

            const synchronize = async () => {
                for await (const { message, syncReport, done } of sync.execute()) {
                    if (message) loading.show(true, message);
                    if (syncReport) await compositionRoot.reports.save(syncReport);
                    if (done) {
                        finishSynchronization(syncReport);
                        return;
                    }
                }
            };

            await result.match({
                success: async () => {
                    await synchronize();
                },
                error: async code => {
                    switch (code) {
                        case "PULL_REQUEST":
                            createPullRequest();
                            break;
                        case "PULL_REQUEST_RESPONSIBLE":
                            updateDialog({
                                title: i18n.t("Pull metadata"),
                                description: i18n.t(
                                    "You are one of the reponsibles for the selected items.\nDo you want to directly pull the metadata?"
                                ),
                                onCancel: () => {
                                    updateDialog(null);
                                },
                                onSave: async () => {
                                    updateDialog(null);
                                    await synchronize();
                                },
                                onInfoAction: () => {
                                    updateDialog(null);
                                    createPullRequest();
                                },
                                cancelText: i18n.t("Cancel"),
                                saveText: i18n.t("Proceed"),
                                infoActionText: i18n.t("Create pull request"),
                            });
                            break;
                        case "INSTANCE_NOT_FOUND":
                            snackbar.warning(i18n.t("Couldn't connect with instance"));
                            break;
                        case "NOT_AUTHORIZED":
                            snackbar.error(
                                i18n.t(
                                    "You do not have the authority to one or multiple target instances of the sync rule"
                                )
                            );
                            break;
                        default:
                            snackbar.error(i18n.t("Unknown synchronization error"));
                    }
                },
            });

            loading.reset();
            closeDialogs();
        } catch (error: any) {
            loading.reset();
            if (error.response?.status === 403) {
                snackbar.error(
                    i18n.t("You do not have the authority to one or multiple target instances of the sync rule")
                );
            } else {
                snackbar.error(i18n.t("An error has ocurred during the synchronization"));
            }
        }
    };

    const additionalColumns = [
        {
            name: "metadata-type",
            text: i18n.t("Metadata type"),
            hidden: config[type].childrenKeys === undefined,
            getValue: (row: MetadataType) => {
                return row.model.getModelName();
            },
        },
    ];

    const updateSourceInstance = useCallback(
        (_type: InstanceSelectionOption, instance?: Instance | Store) => {
            const originInstance = instance?.id ?? "LOCAL";
            const targetInstances = originInstance === "LOCAL" ? [] : ["LOCAL"];

            setSourceInstance(instance ? (instance as Instance) : undefined);
            updateSyncRule(
                syncRule
                    .updateBuilder({ originInstance })
                    .updateTargetInstances(targetInstances)
                    .updateMetadataIds([])
                    .updateExcludedIds([])
            );
        },
        [syncRule]
    );

    return (
        <TestWrapper>
            <PageHeader onBackClick={goBack} title={title}>
                <InstancesSelectors
                    sourceInstance={sourceInstance}
                    onChangeSource={updateSourceInstance}
                    destinationInstance={destinationInstance}
                    onChangeDestination={setDestinationInstance}
                />
            </PageHeader>

            {type === "deleted" ? (
                <DeletedObjectsTable
                    openSynchronizationDialog={openSynchronizationDialog}
                    syncRule={syncRule}
                    onChange={updateSyncRule}
                />
            ) : (
                <MetadataTable
                    remoteInstance={sourceInstance}
                    models={models}
                    selectedIds={syncRule.metadataIds}
                    excludedIds={syncRule.excludedIds}
                    notifyNewSelection={updateSelection}
                    onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                    actionButtonLabel={<SyncIcon />}
                    childrenKeys={config[type].childrenKeys}
                    showIndeterminateSelection={true}
                    additionalColumns={additionalColumns}
                    allowChangingResponsible={type === "metadata" && appConfigurator}
                />
            )}

            {syncDialogOpen && (
                <SyncDialog
                    title={title}
                    syncRule={syncRule}
                    isOpen={true}
                    onChange={updateSyncRuleFromDialog}
                    onClose={closeDialogs}
                    task={handleSynchronization}
                />
            )}

            {!!syncReport && <SyncSummary report={syncReport} onClose={() => setSyncReport(null)} />}

            {!!pullRequestProps && (
                <PullRequestCreationDialog {...pullRequestProps} onClose={() => setPullRequestProps(undefined)} />
            )}

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
        </TestWrapper>
    );
};

export default ManualSyncPage;
