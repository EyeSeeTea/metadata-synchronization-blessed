import { PaginationOptions } from "d2-ui-components";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import {
    ModulePackageListTable,
    PresentationOption,
    ViewOption,
} from "../../../react/components/module-package-list-table/ModulePackageListTable";
import PackageImportDialog from "../../../react/components/package-import-dialog/PackageImportDialog";
import PageHeader from "../../../react/components/page-header/PageHeader";
import SyncSummary from "../../../react/components/sync-summary/SyncSummary";

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
    const [selectedInstance, setSelectedInstance] = useState<Instance | Store>();
    const [resetKey, setResetKey] = useState(Math.random);

    const { list: tableOption = "modules" } = useParams<{ list: ViewOption }>();
    const title = buildTitle(tableOption);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const create = useCallback(() => {
        if (tableOption === "modules") {
            history.push(`/modules/new`);
        } else {
            setOpenImportPackageDialog(true);
        }
    }, [history, tableOption]);

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
            setResetKey(Math.random);
        }
    };

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
            />

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(undefined)} />
            )}

            {selectedInstance && (
                <PackageImportDialog
                    isOpen={openImportPackageDialog}
                    onClose={() => setOpenImportPackageDialog(false)}
                    instance={selectedInstance}
                    openSyncSummary={handleOpenSyncSummaryFromDialog}
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
