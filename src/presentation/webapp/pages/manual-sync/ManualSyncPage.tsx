import SyncIcon from "@material-ui/icons/Sync";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SynchronizationType } from "../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../locales";
import { D2Model } from "../../../../models/dhis/default";
import { metadataModels } from "../../../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    DataSetWithDataElementsModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    IndicatorMappedModel,
} from "../../../../models/dhis/mapping";
import { DataElementGroupModel, DataElementGroupSetModel } from "../../../../models/dhis/metadata";
import SyncReport from "../../../../models/syncReport";
import SyncRule from "../../../../models/syncRule";
import { Ref } from "../../../../types/d2-api";
import { MetadataType } from "../../../../utils/d2";
import { isAppConfigurator } from "../../../../utils/permissions";
import { InstanceSelectionOption } from "../../../react/components/instance-selection-dropdown/InstanceSelectionDropdown";
import { useAppContext } from "../../../react/contexts/AppContext";
import DeletedObjectsTable from "../../../react/components/delete-objects-table/DeletedObjectsTable";
import MetadataTable from "../../../react/components/metadata-table/MetadataTable";
import PageHeader from "../../../react/components/page-header/PageHeader";
import {
    PullRequestCreation,
    PullRequestCreationDialog,
} from "../../../react/components/pull-request-creation-dialog/PullRequestCreationDialog";
import SyncDialog from "../../../react/components/sync-dialog/SyncDialog";
import SyncSummary from "../../../react/components/sync-summary/SyncSummary";
import { TestWrapper } from "../../../react/components/test-wrapper/TestWrapper";
import InstancesSelectors from "./InstancesSelectors";
import { Store } from "../../../../domain/packages/entities/Store";

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
        models: [EventProgramWithDataElementsModel, EventProgramWithIndicatorsModel],
        childrenKeys: ["dataElements", "programIndicators"],
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

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [sourceInstance, setSourceInstance] = useState<Instance>();
    const [destinationInstance, setDestinationInstanceBase] = useState<Ref>();
    const [pullRequestProps, setPullRequestProps] = useState<PullRequestCreation>();
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const updateSyncRuleFromDialog = useCallback((newSyncRule: SyncRule) => {
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

    const goBack = () => history.goBack();

    const updateSelection = useCallback(
        (selection: string[], exclusion: string[]) => {
            updateSyncRule(({ originInstance, targetInstances }) =>
                SyncRule.createOnDemand(type)
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
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    const finishSynchronization = (importResponse?: SyncReport) => {
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

    const handleSynchronization = async (syncRule: SyncRule) => {
        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

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
                if (syncReport) await syncReport.save(api);
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
                    default:
                        snackbar.error(i18n.t("Unknown synchronization error"));
                }
            },
        });

        loading.reset();
        closeDialogs();
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

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(null)} />
            )}

            {!!pullRequestProps && (
                <PullRequestCreationDialog
                    {...pullRequestProps}
                    onClose={() => setPullRequestProps(undefined)}
                />
            )}

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
        </TestWrapper>
    );
};

export default ManualSyncPage;
