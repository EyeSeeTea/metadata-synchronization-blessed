import moment from "moment";
import React from "react";
import { SynchronizationReport } from "../../../../domain/reports/entities/SynchronizationReport";
import i18n from "../../../../utils/i18n";
import { downloadFile } from "../../../utils/download";

export const LinkDownloadOutput: React.FC<{ syncReport: SynchronizationReport }> = props => {
    const { syncReport } = props;

    const downloadJson = React.useCallback(
        (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            ev.preventDefault();
            downloadFile({
                filename: "sync-response" + moment().toISOString() + ".json",
                buffer: JSON.stringify(syncReport),
            });
        },
        [syncReport]
    );

    return (
        <>
            {i18n.t("Output: ", { nsSeparator: false })}

            <a href="/download" onClick={downloadJson}>
                {i18n.t("JSON Response")}
            </a>
        </>
    );
};
