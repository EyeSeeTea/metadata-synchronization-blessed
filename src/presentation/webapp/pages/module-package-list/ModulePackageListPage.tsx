import { PaginationOptions, useLoading, useSnackbar } from "d2-ui-components";
import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { PackageImportRule } from "../../../../domain/package-import/entities/PackageImportRule";
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
import { useAppContext } from "../../../react/contexts/AppContext";

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
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, api } = useAppContext();
    const [syncReport, setSyncReport] = useState<SyncReport>();
    const [openImportPackageDialog, setOpenImportPackageDialog] = useState(false);
    const [packageImportRule, setPackageImportRule] = useState<PackageImportRule | undefined>(
        undefined
    );

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

    const handleInstanceChange = (instance?: Instance) => {
        setPackageImportRule(instance ? PackageImportRule.create(instance) : undefined);
    };

    const handlePackageImportRuleChange = (packageImportRule: PackageImportRule) => {
        setPackageImportRule(packageImportRule);
    };

    const handleExecuteImport = async (packageImportRule: PackageImportRule) => {
        const result = await compositionRoot.packages.get(
            packageImportRule.packageIds[0],
            packageImportRule.instance
        );
        result.match({
            success: async ({ name, contents }) => {
                try {
                    loading.show(true, i18n.t("Importing package {{name}}", { name }));
                    const result = await compositionRoot.metadata.import(contents);

                    const report = SyncReport.create("metadata");
                    report.setStatus(
                        result.status === "ERROR" || result.status === "NETWORK ERROR"
                            ? "FAILURE"
                            : "DONE"
                    );
                    report.addSyncResult({
                        ...result,
                        origin: packageImportRule.instance.toPublicObject(),
                    });
                    await report.save(api);

                    setSyncReport(report);
                } catch (error) {
                    snackbar.error(error.message);
                }
                loading.reset();
                setOpenImportPackageDialog(false);
            },
            error: async () => {
                snackbar.error(i18n.t("Couldn't load package"));
            },
        });
    };

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            <ModulePackageListTable
                showSelector={showSelector}
                showInstances={showInstances}
                onCreate={create}
                viewValue={tableOption}
                onViewChange={setTableOption}
                presentation={"app"}
                openSyncSummary={setSyncReport}
                onInstanceChange={handleInstanceChange}
            />

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(undefined)} />
            )}

            {packageImportRule && (
                <PackageImportDialog
                    isOpen={openImportPackageDialog}
                    onClose={() => setOpenImportPackageDialog(false)}
                    packageImportRule={packageImportRule}
                    onChange={handlePackageImportRuleChange}
                    executeImport={handleExecuteImport}
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
