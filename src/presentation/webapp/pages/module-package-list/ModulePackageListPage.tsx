import { Icon } from "@material-ui/core";
import { PaginationOptions } from "d2-ui-components";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { CreatePackageFromFileDialog } from "../../../react/components/create-package-from-file-dialog/CreatePackageFromFileDialog";
import {
    ModulePackageListTable,
    PresentationOption,
    ViewOption,
} from "../../../react/components/module-package-list-table/ModulePackageListTable";
import PackageImportDialog from "../../../react/components/package-import-dialog/PackageImportDialog";
import PageHeader from "../../../react/components/page-header/PageHeader";
import SyncSummary from "../../../react/components/sync-summary/SyncSummary";
import { useAppContext } from "../../../react/contexts/AppContext";

export interface ModulePackageListPageProps {
    remoteInstance?: Instance;
    remoteStore?: Store;
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation: PresentationOption;
    externalComponents?: ReactNode;
    pageSizeOptions?: number[];
    openSyncSummary?: (result: SyncReport) => void;
    paginationOptions?: PaginationOptions;
    actionButtonLabel?: ReactNode;
}

export const ModulePackageListPage: React.FC = () => {
    const history = useHistory();
    const [syncReport, setSyncReport] = useState<SyncReport>();
    const [openImportPackageDialog, setOpenImportPackageDialog] = useState(false);
    const [addPackageDialogOpen, setAddPackageDialogOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<Instance | Store>();
    const [localInstance, setLocalInstance] = useState<Instance>();
    const [resetKey, setResetKey] = useState(Math.random);
    const [selectedPackagesId, setSelectedPackagesId] = useState<string[]>([]);
    const [disablePackageSelection, setDisablePackageSelection] = useState<boolean>(false);
    const { compositionRoot } = useAppContext();

    const { list: tableOption = "modules" } = useParams<{ list: ViewOption }>();
    const title = buildTitle(tableOption);

    useEffect(() => {
        //TODO: when we have local instance  in data store this will not be necessary
        // because local instance will be selected by dropdown
        compositionRoot.instances.getLocal().then(setLocalInstance);
    }, [compositionRoot]);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const create = useCallback(() => {
        if (tableOption === "modules") {
            history.push(`/modules/new`);
        } else {
            if (!selectedInstance) {
                setAddPackageDialogOpen(true);
            } else {
                setDisablePackageSelection(false);
                setOpenImportPackageDialog(true);
            }
        }
    }, [history, tableOption, selectedInstance]);

    const setTableOption = useCallback(
        (option: ViewOption) => {
            history.push(`/${option}`);
        },
        [history]
    );

    const showInstances = useMemo(
        () => ({
            local: true,
            remote: true,
            store: tableOption === "packages",
        }),
        [tableOption]
    );

    const handleOpenSyncSummaryFromDialog = (syncReport: SyncReport) => {
        setOpenImportPackageDialog(false);
        setSyncReport(syncReport);

        if (tableOption === "packages") {
            setResetKey(Math.random());
        }
    };

    const handleCreatedNewPackageFromFile = () => {
        if (tableOption === "packages") {
            setResetKey(Math.random());
        }
    };

    const handleOnImportFromFilePackage = (packageId: string) => {
        setResetKey(Math.random());
        setSelectedPackagesId([packageId]);
        setOpenImportPackageDialog(true);
        setDisablePackageSelection(true);
    };

    const instanceInImportDialog = selectedInstance ?? localInstance;

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            <ModulePackageListTable
                key={resetKey}
                showSelector={showSelector}
                showInstances={showInstances}
                onCreate={create}
                viewValue={tableOption}
                onViewChange={setTableOption}
                presentation={"app"}
                openSyncSummary={setSyncReport}
                onInstanceChange={setSelectedInstance}
                actionButtonLabel={
                    tableOption === "modules" ? undefined : !selectedInstance ? (
                        <Icon>add</Icon>
                    ) : (
                        <Icon>arrow_downward</Icon>
                    )
                }
            />

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(undefined)} />
            )}

            {instanceInImportDialog && (
                <PackageImportDialog
                    isOpen={openImportPackageDialog}
                    onClose={() => setOpenImportPackageDialog(false)}
                    instance={instanceInImportDialog}
                    selectedPackagesId={selectedPackagesId}
                    openSyncSummary={handleOpenSyncSummaryFromDialog}
                    disablePackageSelection={disablePackageSelection}
                />
            )}

            {addPackageDialogOpen && (
                <CreatePackageFromFileDialog
                    onClose={() => setAddPackageDialogOpen(false)}
                    onSaved={handleCreatedNewPackageFromFile}
                    onImport={handleOnImportFromFilePackage}
                />
            )}
        </React.Fragment>
    );
};

const showSelector = {
    modules: false,
    packages: false,
};

function buildTitle(tableOption: string) {
    switch (tableOption) {
        case "modules":
            return i18n.t("Modules");
        case "packages":
            return i18n.t("Packages");
        default:
            return "";
    }
}

export default ModulePackageListPage;
