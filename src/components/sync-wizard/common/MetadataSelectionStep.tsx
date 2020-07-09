import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useState } from "react";
import { metadataModels } from "../../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
} from "../../../models/dhis/mapping";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    IndicatorModel,
} from "../../../models/dhis/metadata";
import { getMetadata } from "../../../utils/synchronization";
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

export default function MetadataSelectionStep(props: SyncWizardStepProps) {
    const api = useD2Api();
    const { syncRule, onChange } = props;
    const { models, childrenKeys } = config[syncRule.type];

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);
    const snackbar = useSnackbar();

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

    return (
        <MetadataTable
            models={models}
            selectedIds={syncRule.metadataIds}
            excludedIds={syncRule.excludedIds}
            notifyNewSelection={changeSelection}
            childrenKeys={childrenKeys}
            showIndeterminateSelection={true}
        />
    );
}
