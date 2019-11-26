import i18n from "@dhis2/d2-i18n";
import { useD2 } from "d2-api";
import { useSnackbar } from "d2-ui-components";
import React, { useState, useEffect } from "react";
import SyncIcon from "@material-ui/icons/Sync";
import { useHistory } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataElementModel,
} from "../../models/d2Model";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { isAppConfigurator } from "../../utils/permissions";
import { D2 } from "../../types/d2";

const DataPage: React.FC<any> = () => {
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
    const history = useHistory();
    const title = i18n.t("Data synchronization");

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

    const startSynchronization = () => {
        if (syncRule.metadataIds.length > 0) {
            setState(state => ({ ...state, syncDialogOpen: true }));
        } else {
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    //@ts-ignore
    // eslint-disable-next-line
    const finishSynchronization = (importResponse?: any) => {
        if (importResponse) {
            setState(state => ({
                ...state,
                syncDialogOpen: false,
                syncSummaryOpen: true,
                importResponse,
            }));
        } else {
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
        console.log(`syncronization for ${syncRule.name}: not implemented`, syncRule);
        closeDialogs();
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={goBack} title={title} />

            <MetadataTable
                models={[DataElementModel, DataElementGroupModel, DataElementGroupSetModel]}
                selection={syncRule.metadataIds}
                notifyNewSelection={updateSelection}
                onActionButtonClick={appConfigurator ? startSynchronization : undefined}
                actionButtonLabel={<SyncIcon />}
                childrenKeys={["dataElements", "dataElementGroups"]}
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

export default DataPage;
