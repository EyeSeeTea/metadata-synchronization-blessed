import React, { useMemo } from "react";
import { AppStorageType } from "../../../../../../domain/storage-client-config/entities/StorageConfig";
import i18n from "../../../../../../utils/i18n";
import Dropdown from "../../../../../react/core/components/dropdown/Dropdown";

interface StorageSettingDropdownProps {
    selectedOption: AppStorageType | undefined;
    onChangeStorage: (storage: AppStorageType) => void;
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
            <Dropdown<AppStorageType>
                items={options}
                value={selectedOption ?? ""}
                onValueChange={onChangeStorage}
                hideEmpty={true}
                view={"full-width"}
            />
        </React.Fragment>
    );
};
