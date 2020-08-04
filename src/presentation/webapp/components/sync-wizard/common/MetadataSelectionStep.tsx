import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { metadataModels } from "../../../../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
} from "../../../../../models/dhis/mapping";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    IndicatorModel,
} from "../../../../../models/dhis/metadata";
import { getMetadata } from "../../../../../utils/synchronization";
import { useAppContext } from "../../../../common/contexts/AppContext";
import MetadataTable from "../../metadata-table/MetadataTable";
import { SyncWizardStepProps } from "../Steps";

const config = {
    metadata: {
        models: metadataModels,
        childrenKeys: undefined,
    },
    aggregated: {
        models: [
            DataSetModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            IndicatorModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
    },
    events: {
        models: [EventProgramWithDataElementsModel, EventProgramWithIndicatorsModel],
        childrenKeys: ["dataElements", "programIndicators"],
    },
    deleted: {
        models: [],
        childrenKeys: undefined,
    },
};

export default function MetadataSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);
    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [loading, setLoading] = useState<boolean>(true);

    const { models, childrenKeys } = config[syncRule.type];

    const changeSelection = (newMetadataIds: string[], newExclusionIds: string[]) => {
        const additions = _.difference(newMetadataIds, metadataIds);
        if (additions.length > 0) {
            snackbar.info(
                i18n.t("Selected {{difference}} elements", { difference: additions.length }),
                {
                    autoHideDuration: 1000,
                }
            );
        }

        const removals = _.difference(metadataIds, newMetadataIds);
        if (removals.length > 0) {
            snackbar.info(
                i18n.t("Removed {{difference}} elements", {
                    difference: Math.abs(removals.length),
                }),
                { autoHideDuration: 1000 }
            );
        }

        getMetadata(api, newMetadataIds, "id").then(metadata => {
            const types = _.keys(metadata);
            onChange(
                syncRule
                    .updateMetadataIds(newMetadataIds)
                    .updateExcludedIds(newExclusionIds)
                    .updateMetadataTypes(types)
                    .updateDataSyncEnableAggregation(
                        types.includes("indicators") || types.includes("programIndicators")
                    )
            );
        });

        updateMetadataIds(newMetadataIds);
    };

    useEffect(() => {
        compositionRoot
            .instances()
            .getById(syncRule.originInstance)
            .then(setRemoteInstance)
            .catch(() => setRemoteInstance(undefined))
            .finally(() => setLoading(false));
    }, [compositionRoot, syncRule]);

    if (loading) return null;

    return (
        <MetadataTable
            models={models}
            selectedIds={syncRule.metadataIds}
            excludedIds={syncRule.excludedIds}
            notifyNewSelection={changeSelection}
            childrenKeys={childrenKeys}
            showIndeterminateSelection={true}
            remoteInstance={remoteInstance}
        />
    );
}
