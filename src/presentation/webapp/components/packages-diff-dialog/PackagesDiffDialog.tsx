import React from "react";
import _ from "lodash";
import { ConfirmationDialog } from "d2-ui-components/confirmation-dialog/ConfirmationDialog";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { useSnackbar } from "d2-ui-components";
import { LinearProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
    MetadataPackageDiff,
    ModelDiff,
} from "../../../../domain/packages/entities/MetadataPackageDiff";
import SyncSummary from "../sync-summary/SyncSummary";
import { usePackageImporter, getTitle, getChange } from "./utils";

export interface PackagesDiffDialogProps {
    onClose(): void;
    remoteInstance: Instance;
    remotePackage: { id: string; name: string };
}

export type PackageToDiff = { id: string; name: string };

export const PackagesDiffDialog: React.FC<PackagesDiffDialogProps> = props => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [metadataDiff, setMetadataDiff] = React.useState<MetadataPackageDiff>();
    const { remotePackage, remoteInstance, onClose } = props;

    React.useEffect(() => {
        compositionRoot.packages.diff(remotePackage.id, remoteInstance).then(res => {
            res.match({
                error: msg => {
                    snackbar.error(i18n.t("Cannot get data from remote instance") + ": " + msg);
                    onClose();
                },
                success: setMetadataDiff,
            });
        });
    }, [compositionRoot, remotePackage, remoteInstance, onClose, snackbar]);

    const hasChanges = metadataDiff && metadataDiff.hasChanges;
    const packageName = `${remotePackage.name} (${remoteInstance.name})`;
    const [importPackage, syncReport, closeSyncReport] = usePackageImporter(
        packageName,
        metadataDiff,
        onClose
    );

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={getTitle(packageName, metadataDiff)}
                maxWidth="lg"
                fullWidth={true}
                onCancel={onClose}
                onSave={hasChanges ? importPackage : undefined}
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
                    {i18n.t("objects")} ({i18n.t("Unmodified")}: {modelDiff.unmodified.length})
                    <ul>
                        <ModelDiffList modelDiff={modelDiff} />
                    </ul>
                </li>
            ))}
        </ul>
    );
};

export const ModelDiffList: React.FC<{ modelDiff: ModelDiff }> = props => {
    const { modelDiff: diff } = props;
    const classes = useStyles();

    return (
        <React.Fragment>
            {diff.created.length > 0 && (
                <li>
                    <span className={classes.added}>
                        {i18n.t("New")}: {diff.created.length}
                    </span>

                    <List
                        items={diff.created.map(obj => (
                            <li key={obj.id}>
                                [{obj.id}] {obj.name}
                            </li>
                        ))}
                    />
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
                                [{update.obj.id}] {update.obj.name}
                                <List items={update.fieldsUpdated.map(getChange)} />
                            </React.Fragment>
                        ))}
                    />
                </li>
            )}
        </React.Fragment>
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
