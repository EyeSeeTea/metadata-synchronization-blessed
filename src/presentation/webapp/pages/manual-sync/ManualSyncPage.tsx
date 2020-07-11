import { MenuItem, Select } from "@material-ui/core";
import SyncIcon from "@material-ui/icons/Sync";
import { useLoading, useSnackbar } from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SyncRuleType } from "../../../../domain/synchronization/entities/SynchronizationRule";
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
import { D2 } from "../../../../types/d2";
import { MetadataType } from "../../../../utils/d2";
import { isAppConfigurator } from "../../../../utils/permissions";
import { useAppContext } from "../../../common/contexts/AppContext";
import DeletedObjectsTable from "../../components/delete-objects-table/DeletedObjectsTable";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";

const config: Record<
    SyncRuleType,
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
    const { d2, api, compositionRoot } = useAppContext();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Instance>();

    useEffect(() => {
        isAppConfigurator(api).then(updateAppConfigurator);
    }, [api, updateAppConfigurator]);

    const goBack = () => history.goBack();

    const updateSelection = useCallback(
        (selection: string[], exclusion: string[]) => {
            updateSyncRule(syncRule.updateMetadataIds(selection).updateExcludedIds(exclusion));
        },
        [syncRule]
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
        updateSyncRule(SyncRule.createOnDemand(type));
        setSyncDialogOpen(false);
    };

    const handleSynchronization = async (syncRule: SyncRule) => {
        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        const sync = compositionRoot.sync[syncRule.type](syncRule.toBuilder());
        for await (const { message, syncReport, done } of sync.execute()) {
            if (message) loading.show(true, message);
            if (syncReport) await syncReport.save(api);
            if (done) {
                loading.reset();
                finishSynchronization(syncReport);
                return;
            }
        }

        loading.reset();
        closeDialogs();
    };

    const additionalColumns = [
        {
            name: "metadata-type",
            text: i18n.t("Metadata type"),
            hidden: config[type].childrenKeys === undefined,
            getValue: (row: MetadataType) => {
                return row.model.getModelName(d2 as D2);
            },
        },
    ];

    const updateSelectedInstance = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const originInstance = event.target.value as string;
            const targetInstances = originInstance === "LOCAL" ? [] : ["LOCAL"];

            setSelectedInstance(instances.find(instance => instance.id === originInstance));
            updateSyncRule(
                syncRule
                    .updateBuilder({ originInstance })
                    .updateTargetInstances(targetInstances)
                    .updateMetadataIds([])
                    .updateExcludedIds([])
            );
        },
        [instances, syncRule]
    );

    useEffect(() => {
        compositionRoot.instances().list().then(setInstances);
    }, [compositionRoot]);

    return (
        <TestWrapper>
            <PageHeader onBackClick={goBack} title={title}>
                <Select
                    value={selectedInstance?.id ?? "LOCAL"}
                    onChange={updateSelectedInstance}
                    disableUnderline={true}
                    style={{ minWidth: 120, paddingLeft: 25, paddingRight: 25 }}
                >
                    {[{ id: "LOCAL", name: i18n.t("This instance") }, ...instances].map(
                        ({ id, name }) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        )
                    )}
                </Select>
            </PageHeader>

            {type === "deleted" ? (
                <DeletedObjectsTable
                    openSynchronizationDialog={openSynchronizationDialog}
                    syncRule={syncRule}
                    onChange={updateSyncRule}
                />
            ) : (
                <MetadataTable
                    remoteInstance={selectedInstance}
                    models={models}
                    selectedIds={syncRule.metadataIds}
                    excludedIds={syncRule.excludedIds}
                    notifyNewSelection={updateSelection}
                    onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                    actionButtonLabel={<SyncIcon />}
                    childrenKeys={config[type].childrenKeys}
                    showIndeterminateSelection={true}
                    additionalColumns={additionalColumns}
                />
            )}

            {syncDialogOpen && (
                <SyncDialog
                    title={title}
                    syncRule={syncRule}
                    isOpen={true}
                    onChange={updateSyncRule}
                    onClose={closeDialogs}
                    task={handleSynchronization}
                />
            )}

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(null)} />
            )}
        </TestWrapper>
    );
};

export default ManualSyncPage;
