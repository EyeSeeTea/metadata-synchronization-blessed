import { PaginationOptions } from "d2-ui-components";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import {
    ModulePackageListTable,
    PresentationOption,
    ViewOption,
} from "../../../common/components/module-package-list-table/ModulePackageListTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncSummary from "../../components/sync-summary/SyncSummary";

export interface ModulePackageListPageProps {
    remoteInstance?: Instance;
    showStore: boolean;
    onActionButtonClick?: (event: React.MouseEvent<unknown, MouseEvent>) => void;
    presentation: PresentationOption;
    externalComponents?: ReactNode;
    pageSizeOptions?: number[];
    openSyncSummary?: (result: SyncReport) => void;
    paginationOptions?: PaginationOptions;
}

export const ModulePackageListPage: React.FC = () => {
    const history = useHistory();
    const [syncReport, setSyncReport] = useState<SyncReport>();

    const { list: tableOption = "modules" } = useParams<{ list: ViewOption }>();
    const title = buildTitle(tableOption);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const createModule = useCallback(() => {
        history.push(`/modules/new`);
    }, [history]);

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

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            <ModulePackageListTable
                showSelector={showSelector}
                showInstances={showInstances}
                onCreate={createModule}
                viewValue={tableOption}
                onViewChange={setTableOption}
                presentation={"app"}
            />

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(undefined)} />
            )}
        </React.Fragment>
    );
};

const showSelector = { modules: true, packages: true };
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
