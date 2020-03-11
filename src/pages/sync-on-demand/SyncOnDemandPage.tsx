import i18n from "@dhis2/d2-i18n";
import SyncIcon from "@material-ui/icons/Sync";
import { useD2, useD2Api } from "d2-api";
import { useLoading, useSnackbar } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { AggregatedSync } from "../../logic/sync/aggregated";
import { EventsSync } from "../../logic/sync/events";
import { SyncronizationClass } from "../../logic/sync/generic";
import { MetadataSync } from "../../logic/sync/metadata";
import {
    AggregatedDataElementModel,
    D2Model,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    ProgramModel,
} from "../../models/d2Model";
import { metadataModels } from "../../models/d2ModelFactory";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";
import { isAppConfigurator } from "../../utils/permissions";

interface SyncOnDemandPageProps {
    isDelete?: boolean;
}

const config: Record<
    SyncRuleType,
    {
        title: string;
        models: typeof D2Model[];
        childrenKeys: string[] | undefined;
        SyncClass: SyncronizationClass;
    }
> = {
    metadata: {
        title: i18n.t("Metadata Synchronization"),
        models: metadataModels,
        childrenKeys: undefined,
        SyncClass: MetadataSync,
    },
    aggregated: {
        title: i18n.t("Aggregated Data Synchronization"),
        models: [
            DataSetModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
        SyncClass: AggregatedSync,
    },
    events: {
        title: i18n.t("Events Synchronization"),
        models: [ProgramModel],
        childrenKeys: ["dataElements"],
        SyncClass: EventsSync,
    },
};

const SyncOnDemandPage: React.FC<SyncOnDemandPageProps> = ({ isDelete }) => {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const d2 = useD2();
    const api = useD2Api();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    useEffect(() => {
        isAppConfigurator(d2 as D2).then(updateAppConfigurator);
    }, [d2, updateAppConfigurator]);

    const goBack = () => history.goBack();

    const updateSelection = (selection: string[], exclusion: string[]) => {
        updateSyncRule(syncRule.updateMetadataIds(selection).updateExcludedIds(exclusion));
    };

    const openSynchronizationDialog = () => {
        if (syncRule.metadataIds.length > 0) {
            setSyncDialogOpen(true);
        } else {
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    const finishSynchronization = (importResponse?: SyncReport) => {
        setSyncDialogOpen(false);

        if (importResponse) {
            setSyncReport(importResponse);
        } else {
            snackbar.error(i18n.t("Unknown error with the request"));
        }
    };

    const closeDialogs = () => {
        updateSyncRule(SyncRule.createOnDemand(type));
        setSyncDialogOpen(false);
    };

    const handleSynchronization = async (syncRule: SyncRule) => {
        if (isDelete) throw new Error("Delete is not yet implemented on new sync on demand page");

        const { SyncClass } = config[syncRule.type];

        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        try {
            const sync = new SyncClass(d2 as D2, api, syncRule.toBuilder());
            for await (const { message, syncReport, done } of sync.execute()) {
                if (message) loading.show(true, message);
                if (syncReport) await syncReport.save(d2 as D2);
                if (done) {
                    loading.reset();
                    finishSynchronization(syncReport);
                    return;
                }
            }
        } catch (error) {
            console.error(error);
            snackbar.error(i18n.t("Failed to execute manual synchronization"));
        }

        loading.reset();
        closeDialogs();
    };

    return (
        <TestWrapper>
            <PageHeader onBackClick={goBack} title={title} />

            <MetadataTable
                models={models}
                selectedIds={syncRule.metadataIds}
                excludedIds={syncRule.excludedIds}
                notifyNewSelection={updateSelection}
                onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                actionButtonLabel={<SyncIcon />}
                childrenKeys={config[type].childrenKeys}
                showIndeterminateSelection={true}
            />

            {syncDialogOpen && (
                <SyncDialog
                    title={title}
                    syncRule={syncRule}
                    isOpen={true}
                    onChange={updateSyncRule}
                    onClose={closeDialogs}
                    task={handleSynchronization}
                />
            )}

            {!!syncReport && (
                <SyncSummary response={syncReport} onClose={() => setSyncReport(null)} />
            )}
        </TestWrapper>
    );
};

export default SyncOnDemandPage;
