import i18n from "@dhis2/d2-i18n";
import SyncIcon from "@material-ui/icons/Sync";
import { useD2, useD2Api } from "d2-api";
import {
    ObjectsTable,
    ReferenceObject,
    TableState,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { AggregatedSync } from "../../logic/sync/aggregated";
import { DeletedSync } from "../../logic/sync/deleted";
import { EventsSync } from "../../logic/sync/events";
import { SyncronizationClass } from "../../logic/sync/generic";
import { MetadataSync } from "../../logic/sync/metadata";
import {
    AggregatedDataElementModel,
    D2Model,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    IndicatorMappedModel,
    ProgramModel,
    ProgramIndicatorModel,
} from "../../models/d2Model";
import { metadataModels } from "../../models/d2ModelFactory";
import DeletedObject from "../../models/deletedObjects";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";
import { MetadataType } from "../../utils/d2";
import { isAppConfigurator } from "../../utils/permissions";
import { getMetadata } from "../../utils/synchronization";
import {
    deletedObjectsActions,
    deletedObjectsColumns,
    deletedObjectsDetails,
} from "./deletedObjects";

const config: Record<
    SyncRuleType,
    {
        title: string;
        models: typeof D2Model[];
        childrenKeys: string[] | undefined;
        SyncClass: SyncronizationClass;
    }
> = {
    metadata: {
        title: i18n.t("Metadata Synchronization"),
        models: metadataModels,
        childrenKeys: undefined,
        SyncClass: MetadataSync,
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization"),
        models: [
            DataSetModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            IndicatorMappedModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
        SyncClass: AggregatedSync,
    },
    events: {
        title: i18n.t("Events Synchronization"),
        models: [ProgramModel, ProgramIndicatorModel],
        childrenKeys: ["dataElements"],
        SyncClass: EventsSync,
    },
    deleted: {
        title: i18n.t("Deleted Objects Synchronization"),
        models: [],
        childrenKeys: undefined,
        SyncClass: DeletedSync,
    },
};

const SyncOnDemandPage: React.FC = () => {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const d2 = useD2();
    const api = useD2Api();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    const [deletedObjectsRows, setDeletedObjectsRows] = useState<MetadataType[]>([]);
    useEffect(() => {
        if (type === "deleted")
            DeletedObject.list(api, {}, {}).then(({ objects }) => setDeletedObjectsRows(objects));
    }, [api, type]);

    useEffect(() => {
        isAppConfigurator(api).then(updateAppConfigurator);
    }, [api, updateAppConfigurator]);

    const goBack = () => history.goBack();

    const updateSelection = async (selection: string[], exclusion: string[]) => {
        const metadata = await getMetadata(api, selection, "id");
        updateSyncRule(
            syncRule
                .updateMetadataIds(selection)
                .updateExcludedIds(exclusion)
                .updateMetadataTypes(_.keys(metadata))
        );
    };

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
        const { SyncClass } = config[syncRule.type];

        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        const sync = new SyncClass(d2 as D2, api, syncRule.toBuilder());
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

    const handleDeletedObjectsTableChange = (tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        updateSyncRule(syncRule.updateMetadataIds(selection.map(({ id }) => id)));
    };

    return (
        <TestWrapper>
            <PageHeader onBackClick={goBack} title={title} />

            {type !== "deleted" && (
                <MetadataTable
                    models={models}
                    selectedIds={syncRule.metadataIds}
                    excludedIds={syncRule.excludedIds}
                    notifyNewSelection={updateSelection}
                    onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                    actionButtonLabel={<SyncIcon />}
                    childrenKeys={config[type].childrenKeys}
                    showIndeterminateSelection={true}
                />
            )}

            {type === "deleted" && (
                <ObjectsTable<MetadataType>
                    rows={deletedObjectsRows}
                    columns={deletedObjectsColumns}
                    details={deletedObjectsDetails}
                    actions={deletedObjectsActions}
                    forceSelectionColumn={true}
                    onActionButtonClick={openSynchronizationDialog}
                    onChange={handleDeletedObjectsTableChange}
                    actionButtonLabel={<SyncIcon />}
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

export default SyncOnDemandPage;
