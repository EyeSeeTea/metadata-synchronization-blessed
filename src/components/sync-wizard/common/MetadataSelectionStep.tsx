import i18n from "@dhis2/d2-i18n";
import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useState } from "react";
import {
    AggregatedDataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    ProgramModel,
} from "../../../models/d2Model";
import { metadataModels } from "../../../models/d2ModelFactory";
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
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
    },
    events: {
        models: [ProgramModel],
        childrenKeys: ["dataElements"],
    },
};

export default function MetadataSelectionStep(props: SyncWizardStepProps) {
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

        onChange(syncRule.updateMetadataIds(newMetadataIds).updateExcludedIds(newExclusionIds));
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
