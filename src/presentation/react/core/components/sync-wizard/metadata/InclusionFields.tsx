import React from "react";
import Dropdown from "../../dropdown/Dropdown";
import styled from "styled-components";
import i18n from "../../../../../../utils/i18n";
import { InclusionMode } from "../../../../../../domain/user-settings/UserSettings";

export type InclusionFieldsProps = {
    sharingSettings: {
        value: InclusionMode;
        options: { id: InclusionMode; name: string }[];
        onValueChange: (value: InclusionMode) => void;
        label?: string;
    };
    users: {
        value: InclusionMode;
        options: { id: InclusionMode; name: string }[];
        onValueChange: (value: InclusionMode) => void;
        label?: string;
    };
    orgUnits: {
        value: InclusionMode;
        options: { id: InclusionMode; name: string }[];
        onValueChange: (value: InclusionMode) => void;
        label?: string;
    };
};

export const InclusionFields: React.FC<InclusionFieldsProps> = ({ sharingSettings, users, orgUnits }) => (
    <>
        <DropdownContainer>
            <Dropdown<InclusionMode>
                value={sharingSettings.value}
                items={sharingSettings.options}
                label={sharingSettings.label ?? i18n.t("Include owner and sharing settings")}
                onValueChange={sharingSettings.onValueChange}
                hideEmpty
            />
        </DropdownContainer>
        <DropdownContainer>
            <Dropdown<InclusionMode>
                value={users.value}
                items={users.options}
                label={users.label ?? i18n.t("Include users")}
                onValueChange={users.onValueChange}
                hideEmpty
            />
        </DropdownContainer>
        <DropdownContainer>
            <Dropdown<InclusionMode>
                value={orgUnits.value}
                items={orgUnits.options}
                label={orgUnits.label ?? i18n.t("Include organisation units")}
                onValueChange={orgUnits.onValueChange}
                hideEmpty
            />
        </DropdownContainer>
    </>
);

const DropdownContainer = styled.div`
    margin-block-end: 16px;

    & > div {
        width: 100%;
        margin-block-start: 20px;
        margin-block-end: 20px;
        margin-inline-start: -10px;
    }
`;
