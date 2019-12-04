import i18n from "@dhis2/d2-i18n";
import SyncIcon from "@material-ui/icons/Sync";
import { useD2, useD2Api } from "d2-api";
import { useSnackbar, withLoading } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { D2Model } from "../../models/d2Model";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { isAppConfigurator } from "../../utils/permissions";
import { startDelete } from "../../logic/delete";
import {
    startMetadataSynchronization,
    startDataSynchronization,
} from "../../logic/synchronization";

interface GenericSynchronizatgionPageProps {
    models: typeof D2Model[];
    title: string;
    isDelete?: boolean;
    loading: any;
}

const DataPage: React.FC<GenericSynchronizatgionPageProps> = ({
    models,
    title,
    isDelete,
    loading,
}) => {
    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand("data"));
    const [appConfigurator, updateAppConfigurator] = useState(false);

    const [state, setState] = useState({
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
        enableDialogSync: false,
    });

    const snackbar = useSnackbar();
    const d2 = useD2();
    const api = useD2Api();
    const history = useHistory();

    useEffect(() => {
        isAppConfigurator(d2 as D2).then(updateAppConfigurator);
    }, [d2, updateAppConfigurator]);

    const goBack = () => history.goBack();

    const updateSelection = (selection: string[]) => {
        updateSyncRule(syncRule.updateMetadataIds(selection));
    };

    const closeSummary = () => {
        setState(state => ({ ...state, syncSummaryOpen: false }));
    };

    const openSynchronizationDialog = () => {
        if (syncRule.metadataIds.length > 0) {
            setState(state => ({ ...state, syncDialogOpen: true }));
        } else {
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    const finishSynchronization = (importResponse?: any) => {
        if (importResponse) {
            setState(state => ({
                ...state,
                syncDialogOpen: false,
                syncSummaryOpen: true,
                importResponse,
            }));
        } else {
            snackbar.error(i18n.t("Unknown error with the request"));
            setState(state => ({ ...state, syncDialogOpen: false }));
        }
    };

    const closeDialogs = () => {
        updateSyncRule(SyncRule.createOnDemand("data"));
        setState(state => ({
            ...state,
            syncDialogOpen: false,
            syncSummaryOpen: false,
        }));
    };

    const handleSynchronization = async (syncRule: SyncRule) => {
        const { metadataIds, targetInstances, syncParams, dataParams } = syncRule;

        const action = isDelete
            ? startDelete
            : syncRule.type === "metadata"
            ? startMetadataSynchronization
            : startDataSynchronization;
        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        try {
            const builder = { metadataIds, targetInstances, syncParams, dataParams };
            for await (const { message, syncReport, done } of action(d2 as D2, api, builder)) {
                if (message) loading.show(true, message);
                if (syncReport) await syncReport.save(d2 as D2);
                if (done) {
                    loading.reset();
                    finishSynchronization(syncReport);
                    return;
                }
            }
        } catch (error) {
            console.error(error);
        }

        loading.reset();
        closeDialogs();
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={goBack} title={title} />

            <MetadataTable
                models={models}
                selection={syncRule.metadataIds}
                notifyNewSelection={updateSelection}
                onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                actionButtonLabel={<SyncIcon />}
                childrenKeys={
                    syncRule.type === "data" ? ["dataElements", "dataElementGroups"] : undefined
                }
            />

            <SyncDialog
                title={title}
                syncRule={syncRule}
                isOpen={state.syncDialogOpen}
                onChange={updateSyncRule}
                onClose={closeDialogs}
                task={handleSynchronization}
            />

            <SyncSummary
                d2={d2}
                response={state.importResponse}
                isOpen={state.syncSummaryOpen}
                handleClose={closeSummary}
            />
        </React.Fragment>
    );
};

export default withLoading(DataPage);
