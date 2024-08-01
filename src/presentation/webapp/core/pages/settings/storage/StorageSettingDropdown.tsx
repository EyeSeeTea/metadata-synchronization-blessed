import React, { useMemo } from "react";
import { StorageType } from "../../../../../../domain/config/entities/Config";
import i18n from "../../../../../../locales";
import Dropdown from "../../../../../react/core/components/dropdown/Dropdown";

interface StorageSettingDropdownProps {
    selectedOption: StorageType;
    onChangeStorage: (storage: StorageType) => void;
}

export const StorageSettingDropdown: React.FC<StorageSettingDropdownProps> = ({ selectedOption, onChangeStorage }) => {
    const options = useMemo(
        () => [
            { id: "dataStore" as const, name: i18n.t("Data Store") },
            { id: "constant" as const, name: i18n.t("Metadata constant") },
        ],
        []
    );

    return (
        <React.Fragment>
            <Dropdown<StorageType>
                items={options}
                value={selectedOption}
                onValueChange={onChangeStorage}
                hideEmpty={true}
                view={"full-width"}
            />
        </React.Fragment>
    );
};
