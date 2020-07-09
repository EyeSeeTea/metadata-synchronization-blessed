import i18n from "@dhis2/d2-i18n";
import SyncIcon from "@material-ui/icons/Sync";
import { useD2, useD2Api } from "d2-api";
import { useLoading, useSnackbar } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import DeletedObjectsTable from "../../components/delete-objects-table/DeletedObjectsTable";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";
import SyncDialog from "../../components/sync-dialog/SyncDialog";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { AggregatedSync } from "../../logic/sync/aggregated";
import { DeletedSync } from "../../logic/sync/deleted";
import { EventsSync } from "../../logic/sync/events";
import { SyncronizationClass } from "../../logic/sync/generic";
import { MetadataSync } from "../../logic/sync/metadata";
import { D2Model } from "../../models/dhis/default";
import { metadataModels } from "../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    DataSetWithDataElementsModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    IndicatorMappedModel,
} from "../../models/dhis/mapping";
import { DataElementGroupModel, DataElementGroupSetModel } from "../../models/dhis/metadata";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";
import { MetadataType } from "../../utils/d2";
import { isAppConfigurator } from "../../utils/permissions";

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
            DataSetWithDataElementsModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            IndicatorMappedModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
        SyncClass: AggregatedSync,
    },
    events: {
        title: i18n.t("Events Synchronization"),
        models: [EventProgramWithDataElementsModel, EventProgramWithIndicatorsModel],
        childrenKeys: ["dataElements", "programIndicators"],
        SyncClass: EventsSync,
    },
    deleted: {
        title: i18n.t("Deleted Objects Synchronization"),
        models: [],
        childrenKeys: undefined,
        SyncClass: DeletedSync,
    },
};

const SyncOnDemandPage: React.FC = () => {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const d2 = useD2() as D2;
    const api = useD2Api();
    const history = useHistory();
    const { type } = useParams() as { type: SyncRuleType };
    const { title, models } = config[type];

    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand(type));
    const [appConfigurator, updateAppConfigurator] = useState(false);
    const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    useEffect(() => {
        isAppConfigurator(api).then(updateAppConfigurator);
    }, [api, updateAppConfigurator]);

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
        const { SyncClass } = config[syncRule.type];

        loading.show(true, i18n.t(`Synchronizing ${syncRule.type}`));

        const sync = new SyncClass(d2, api, syncRule.toBuilder());
        for await (const { message, syncReport, done } of sync.execute()) {
            if (message) loading.show(true, message);
            if (syncReport) await syncReport.save(api);
            if (done) {
                loading.reset();
                finishSynchronization(syncReport);
                return;
            }
        }

        loading.reset();
        closeDialogs();
    };

    const additionalColumns = [
        {
            name: "metadata-type",
            text: i18n.t("Metadata type"),
            hidden: config[type].childrenKeys === undefined,
            getValue: (row: MetadataType) => {
                return row.model.getModelName(d2);
            },
        },
    ];

    return (
        <TestWrapper>
            <PageHeader onBackClick={goBack} title={title} />

            {type === "deleted" ? (
                <DeletedObjectsTable
                    openSynchronizationDialog={openSynchronizationDialog}
                    syncRule={syncRule}
                    onChange={updateSyncRule}
                />
            ) : (
                <MetadataTable
                    models={models}
                    selectedIds={syncRule.metadataIds}
                    excludedIds={syncRule.excludedIds}
                    notifyNewSelection={updateSelection}
                    onActionButtonClick={appConfigurator ? openSynchronizationDialog : undefined}
                    actionButtonLabel={<SyncIcon />}
                    childrenKeys={config[type].childrenKeys}
                    showIndeterminateSelection={true}
                    additionalColumns={additionalColumns}
                />
            )}

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
