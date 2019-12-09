import i18n from "@dhis2/d2-i18n";
import SyncIcon from "@material-ui/icons/Sync";
import { useD2, useD2Api } from "d2-api";
import { useSnackbar, withLoading } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { startDelete } from "../../logic/delete";
import {
    startDataSynchronization,
    startMetadataSynchronization,
} from "../../logic/synchronization";
import {
    AggregatedDataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    ProgramModel,
} from "../../models/d2Model";
import { metadataModels } from "../../models/d2ModelFactory";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";
import { isAppConfigurator } from "../../utils/permissions";

interface GenericSynchronizationPageProps {
    isDelete?: boolean;
    loading: any; // TODO
}

const config = {
    metadata: {
        title: i18n.t("Metadata Synchronization"),
        models: metadataModels,
    },
    aggregated: {
        title: i18n.t("Aggregated Synchronization"),
        models: [
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            DataSetModel,
        ],
    },
    events: {
        title: i18n.t("Events Synchronization"),
        models: [ProgramModel],
    },
};

const SyncOnDemandPage: React.FC<GenericSynchronizationPageProps> = ({ isDelete, loading }) => {
    const snackbar = useSnackbar();
    const d2 = useD2();
    const api = useD2Api();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);

    const [state, setState] = useState({
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
        enableDialogSync: false,
    });

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
        updateSyncRule(SyncRule.createOnDemand(type));
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
                    type !== "metadata"
                        ? ["dataElements", "dataElementGroups", "programStages"]
                        : undefined
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

export default withLoading(SyncOnDemandPage);
