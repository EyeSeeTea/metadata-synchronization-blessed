import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useState } from "react";
import {
    AggregatedDataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    IndicatorModel,
    ProgramModel,
} from "../../../models/d2Model";
import { metadataModels } from "../../../models/d2ModelFactory";
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
        models: [ProgramModel],
        childrenKeys: ["dataElements"],
    },
    deleted: {
        models: [],
        childrenKeys: undefined,
    },
};

export default function MetadataSelectionStep(props: SyncWizardStepProps) {
    const { syncRule, onChange } = props;
    const { models, childrenKeys } = config[syncRule.type];

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);
    const snackbar = useSnackbar();
    const api = useD2Api();

    const changeSelection = async (newMetadataIds: string[], newExclusionIds: string[]) => {
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

        const metadata = await getMetadata(api, newMetadataIds, "id");
        onChange(
            syncRule
                .updateMetadataIds(newMetadataIds)
                .updateExcludedIds(newExclusionIds)
                .updateMetadataTypes(_.keys(metadata))
        );
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
