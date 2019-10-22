import React from "react";
import i18n from "@dhis2/d2-i18n";
import { withSnackbar, withLoading } from "d2-ui-components";
import SyncIcon from "@material-ui/icons/Sync";
import { withRouter, RouteComponentProps } from "react-router-dom";

//import { startSynchronization } from "../../logic/synchronization";
//import { startDelete } from "../../logic/delete";
import MetadataTable from "../metadata-table/MetadataTable";
import SyncWizardDialog from "../wizard/common/SyncWizardDialog";
import SyncSummary from "../sync-summary/SyncSummary";
import PageHeader from "../page-header/PageHeader";
import SyncReport from "../../models/syncReport";
import { isAppConfigurator } from "../../utils/permissions";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { D2Model } from "../../models/d2Model";

/**
 * TODO: This component is new version of GenericSynchronizationPage using sync rule model and SyncWizardDialog
 * to on-demand synchronizations. Currently MetadataPage is using old GenericSynchronizationPage.
 * On the future for MetadataPage we should delete old GenericSynchronizationPage, use this generic page and rename this one to
 * GenericSynchronizationPage
 */

interface GenericSynchronizationPageProps extends RouteComponentProps<any> {
    title: string;
    d2: D2;
    snackbar: any;
    loading: any;
    isDelete: boolean;
    dialogStepsBaseInfo: any[];
    models: D2Model[];
}

const GenericSynchronizationWizardPage: React.FC<GenericSynchronizationPageProps> = ({
    title,
    d2,
    snackbar,
    loading,
    isDelete,
    dialogStepsBaseInfo,
    models,
    history,
    ...rest
}) => {
    const [state, setState] = React.useState({
        syncRule: SyncRule.createOnDemand(),
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
        enableDialogSync: false,
    });
    const [appConfigurator, setAppConfigurator] = React.useState(false);

    React.useEffect(() => {
        const retrieveIsAppConfigurator = async () => {
            const appConfigurator = await isAppConfigurator(d2);

            setAppConfigurator(appConfigurator);
        };
        retrieveIsAppConfigurator();
    }, [d2, appConfigurator]);

    const onChange = async (syncRule: SyncRule) => {
        const enableDialogSync: boolean = await syncRule.isValid();
        setState({ ...state, syncRule: syncRule, enableDialogSync: enableDialogSync });
    };

    const goHome = () => {
        history.push("/");
    };

    const closeSummary = () => {
        setState({ ...state, syncSummaryOpen: false });
    };

    const changeSelection = (metadataIds: string[]) => {
        const updatedSyncRule = state.syncRule.updateMetadataIds(metadataIds);

        setState({ ...state, syncRule: updatedSyncRule });
    };

    const startSynchronization = () => {
        if (state.syncRule.metadataIds.length > 0) {
            setState({ ...state, syncDialogOpen: true });
        } else {
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    const finishSynchronization = (importResponse?: any) => {
        if (importResponse) {
            setState({
                ...state,
                syncDialogOpen: false,
                syncSummaryOpen: true,
                importResponse: importResponse,
            });
        } else {
            setState({ ...state, syncDialogOpen: false });
        }
    };

    const handleSynchronization = async (syncRule: SyncRule) => {
        console.log(`syncronization for ${syncRule.name}: not implemented`);
    };

    debugger;
    return (
        <React.Fragment>
            <PageHeader onBackClick={goHome} title={title} />

            <MetadataTable
                d2={d2}
                models={models}
                initialModel={models[0]}
                initialSelection={state.syncRule.metadataIds}
                notifyNewSelection={changeSelection}
                onButtonClick={appConfigurator ? startSynchronization : null}
                buttonLabel={<SyncIcon />}
                {...rest}
            />

            <SyncWizardDialog
                title={title}
                d2={d2}
                stepsBaseInfo={dialogStepsBaseInfo}
                syncRule={state.syncRule}
                isOpen={state.syncDialogOpen}
                onChange={onChange}
                handleClose={finishSynchronization}
                task={handleSynchronization}
                enableSync={state.enableDialogSync}
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

export default withLoading(withSnackbar(withRouter(GenericSynchronizationWizardPage)));
