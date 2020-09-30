import React from "react";
import { MetadataModule } from "../../../../../domain/modules/entities/MetadataModule";
import i18n from "../../../../../locales";
import { Toggle } from "../../toggle/Toggle";
import { ModuleWizardStepProps } from "../Steps";

export const AdvancedMetadataOptionsStep: React.FC<ModuleWizardStepProps<MetadataModule>> = ({
    module,
    onChange,
}) => {
    const changeSharingSettings = (includeUserInformation: boolean) => {
        onChange(module.update({ includeUserInformation }));
    };

    const changeOrgUnitReferences = (removeOrgUnitReferences: boolean) => {
        onChange(module.update({ removeOrgUnitReferences }));
    };

    return (
        <React.Fragment>
            <div>
                <Toggle
                    label={i18n.t("Include user information and sharing settings")}
                    onValueChange={changeSharingSettings}
                    value={module.includeUserInformation}
                />
            </div>
            <div>
                <Toggle
                    label={i18n.t("Remove organisation unit references")}
                    onValueChange={changeOrgUnitReferences}
                    value={module.removeOrgUnitReferences}
                />
            </div>
        </React.Fragment>
    );
};
