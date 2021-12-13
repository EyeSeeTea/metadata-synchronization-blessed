import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import { useCallback } from "react";
import { MetadataModule } from "../../../../../../domain/modules/entities/MetadataModule";
import i18n from "../../../../../../locales";
import {
    DashboardModel,
    DataSetModel,
    ProgramModel,
    ProgramRuleModel,
    RelationshipTypeModel,
    UserGroupModel,
} from "../../../../../../models/dhis/metadata";
import MetadataTable from "../../metadata-table/MetadataTable";
import { ModuleWizardStepProps } from "../Steps";

const config = {
    module: {
        metadata: {
            models: [
                DataSetModel,
                ProgramModel,
                ProgramRuleModel,
                DashboardModel,
                RelationshipTypeModel,
                UserGroupModel,
            ],
            childrenKeys: [],
        },
    },
};

export const MetadataSelectionStep = ({ module, onChange }: ModuleWizardStepProps<MetadataModule>) => {
    const snackbar = useSnackbar();
    const { models, childrenKeys } = config["module"][module.type];

    const changeSelection = useCallback(
        (newMetadataIds: string[], newExcludedIds: string[]) => {
            const additions = _.difference(newMetadataIds, module.metadataIds);
            if (additions.length > 0) {
                snackbar.info(i18n.t("Selected {{difference}} elements", { difference: additions.length }), {
                    autoHideDuration: 1000,
                });
            }

            const removals = _.difference(module.metadataIds, newMetadataIds);
            if (removals.length > 0) {
                snackbar.info(
                    i18n.t("Removed {{difference}} elements", {
                        difference: Math.abs(removals.length),
                    }),
                    { autoHideDuration: 1000 }
                );
            }

            onChange(module.update({ metadataIds: newMetadataIds, excludedIds: newExcludedIds }));
        },
        [module, onChange, snackbar]
    );

    return (
        <MetadataTable
            models={models}
            selectedIds={module.metadataIds}
            excludedIds={module.excludedIds}
            notifyNewSelection={changeSelection}
            childrenKeys={childrenKeys}
            showIndeterminateSelection={true}
        />
    );
};
