import { useLoading, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import {
    FieldUpdate,
    MetadataPackageDiff,
} from "../../../../domain/packages/entities/MetadataPackageDiff";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { useAppContext } from "../../../common/contexts/AppContext";

export function getChange(u: FieldUpdate): string {
    return `${u.field}: ${truncate(u.oldValue)} -> ${truncate(u.newValue)}`;
}

function truncate(s: string) {
    return _.truncate(s, { length: 50 });
}

export function getTitle(packageName: string, metadataDiff: MetadataPackageDiff | undefined) {
    let prefix: string;
    if (!metadataDiff) {
        prefix = i18n.t("Comparing package contents");
    } else if (metadataDiff.hasChanges) {
        prefix = i18n.t("Changes found in remote package");
    } else {
        prefix = i18n.t("No changes found in remote package");
    }
    return `${prefix}: ${packageName}`;
}

export function usePackageImporter(
    instance: Instance | undefined,
    packageName: string,
    metadataDiff: MetadataPackageDiff | undefined,
    onClose: () => void
) {
    const { compositionRoot, api } = useAppContext();
    const loading = useLoading();
    const snackbar = useSnackbar();
    const [syncReport, setSyncReport] = React.useState<SyncReport>();

    const closeSyncReport = React.useCallback(() => {
        setSyncReport(undefined);
        onClose();
    }, [setSyncReport, onClose]);

    const importPackage = React.useCallback(() => {
        async function import_() {
            if (!metadataDiff) return;
            loading.show(true, i18n.t("Importing package {{name}}", { name: packageName }));

            const result = await compositionRoot.metadata.import(metadataDiff.mergeableMetadata);
            const report = SyncReport.create("metadata");
            report.setStatus(
                result.status === "ERROR" || result.status === "NETWORK ERROR" ? "FAILURE" : "DONE"
            );
            report.addSyncResult({ ...result, origin: instance?.toPublicObject() });
            await report.save(api);

            setSyncReport(report);
        }

        import_()
            .catch(err => snackbar.error(err.message))
            .finally(() => loading.reset());
    }, [packageName, metadataDiff, compositionRoot, loading, snackbar, api, instance]);

    return { importPackage, syncReport, closeSyncReport };
}
