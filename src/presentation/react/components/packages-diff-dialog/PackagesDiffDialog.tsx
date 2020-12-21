import { LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useSnackbar } from "d2-ui-components";
import { ConfirmationDialog } from "d2-ui-components/confirmation-dialog/ConfirmationDialog";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import {
    MetadataPackageDiff,
    ModelDiff,
} from "../../../../domain/packages/entities/MetadataPackageDiff";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import SyncSummary from "../sync-summary/SyncSummary";
import { getChange, getTitle, usePackageImporter } from "./utils";

export interface PackagesDiffDialogProps {
    onClose(): void;
    remoteInstance?: Instance;
    remoteStore?: Store;
    packages: DiffPackages;
}

export interface DiffPackages {
    base?: PackageToDiff;
    merge: PackageToDiff;
}

export type PackageToDiff = { id: string; name: string; version: string };

export const PackagesDiffDialog: React.FC<PackagesDiffDialogProps> = props => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [metadataDiff, setMetadataDiff] = useState<MetadataPackageDiff>();
    const { packages, remoteStore, remoteInstance, onClose } = props;
    const { base: packageBase, merge: packageMerge } = packages;
    const showImportButton = !packageBase;

    useEffect(() => {
        compositionRoot.packages
            .diff(packageBase?.id, packageMerge.id, remoteStore?.id, remoteInstance)
            .then(res => {
                res.match({
                    error: msg => {
                        snackbar.error(i18n.t("Cannot get data from remote instance") + ": " + msg);
                        onClose();
                    },
                    success: setMetadataDiff,
                });
            });
    }, [
        compositionRoot,
        packageBase,
        packageMerge,
        remoteStore,
        remoteInstance,
        onClose,
        snackbar,
    ]);

    const hasChanges = metadataDiff && metadataDiff.hasChanges;
    const packageName = `${packageMerge.name} (${remoteInstance?.name ?? "Store"})`;
    const { importPackage, syncReport, closeSyncReport } = usePackageImporter(
        remoteInstance,
        packageName,
        metadataDiff,
        onClose
    );

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={getTitle(packageBase, packageMerge, metadataDiff)}
                maxWidth="lg"
                fullWidth={true}
                onCancel={onClose}
                onSave={hasChanges && showImportButton ? importPackage : undefined}
                cancelText={i18n.t("Close")}
                saveText={i18n.t("Import")}
            >
                {metadataDiff ? (
                    <MetadataDiffTable metadataDiff={metadataDiff.changes} />
                ) : (
                    <LinearProgress />
                )}
            </ConfirmationDialog>

            {!!syncReport && <SyncSummary response={syncReport} onClose={closeSyncReport} />}
        </React.Fragment>
    );
};

export const MetadataDiffTable: React.FC<{
    metadataDiff: MetadataPackageDiff["changes"];
}> = props => {
    const { metadataDiff } = props;
    const classes = useStyles();

    return (
        <ul>
            {_.map(metadataDiff, (modelDiff, model) => (
                <li key={model}>
                    <h3 className={classes.modelTitle}>{model}</h3>: {modelDiff.total}{" "}
                    {i18n.t("objects")} ({i18n.t("Unmodified")}: {modelDiff.unmodified.length},{" "}
                    {i18n.t("New")}: {modelDiff.created.length}, {i18n.t("Updated")}:{" "}
                    {modelDiff.updates.length})
                    <ModelDiffList modelDiff={modelDiff} />
                </li>
            ))}
        </ul>
    );
};

export const ModelDiffList: React.FC<{ modelDiff: ModelDiff }> = props => {
    const { modelDiff: diff } = props;
    const classes = useStyles();

    return (
        <ul>
            {diff.created.length > 0 && (
                <li>
                    <span className={classes.added}>
                        {i18n.t("New")}: {diff.created.length}
                    </span>

                    <List items={diff.created.map(obj => `${obj.name} (${obj.id})`)} />
                </li>
            )}

            {diff.updates.length > 0 && (
                <li>
                    <span className={classes.updated}>
                        {i18n.t("Updated")}: {diff.updates.length}
                    </span>

                    <List
                        items={diff.updates.map(update => (
                            <React.Fragment key={update.obj.id}>
                                {update.obj.name} [{update.obj.id}]
                                <List items={update.fieldsUpdated.map(getChange)} />
                            </React.Fragment>
                        ))}
                    />
                </li>
            )}
        </ul>
    );
};

export const List: React.FC<{ items: React.ReactNode[] }> = props => {
    const { items } = props;
    return (
        <ul>
            {items.map((item, idx) => (
                <li key={idx}>{item}</li>
            ))}
        </ul>
    );
};

const useStyles = makeStyles({
    modelTitle: { display: "inline" },
    added: { color: "green" },
    updated: { color: "orange" },
});
