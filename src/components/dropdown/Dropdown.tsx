import i18n from "@dhis2/d2-i18n";
import { FormControl, InputLabel, MenuItem, MuiThemeProvider, Select } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import _ from "lodash";
import React from "react";

export interface DropdownOption {
    id: string;
    name: string;
}

interface DropdownProps {
    items: DropdownOption[];
    value: string;
    label: string;
    onChange?: Function;
    onValueChange?(value: string): void;
    hideEmpty?: boolean;
    emptyLabel?: string;
}

const getMaterialTheme = () =>
    createMuiTheme({
        overrides: {
            MuiFormLabel: {
                root: {
                    color: "#aaaaaa",
                    "&$focused": {
                        color: "#aaaaaa",
                    },
                    top: "-9px !important",
                    marginLeft: 10,
                },
            },
            MuiInput: {
                root: {
                    marginLeft: 10,
                },
                formControl: {
                    minWidth: 250,
                    marginTop: "8px !important",
                },
                input: {
                    color: "#565656",
                },
            },
        },
    });

const Dropdown: React.FC<DropdownProps> = ({
    items,
    value,
    onChange = _.noop,
    onValueChange = _.noop,
    label,
    hideEmpty = false,
    emptyLabel,
}) => {
    const materialTheme = getMaterialTheme();
    return (
        <MuiThemeProvider theme={materialTheme}>
            <FormControl>
                <InputLabel>{label}</InputLabel>
                <Select
                    key={`dropdown-select-${label}`}
                    value={value}
                    onChange={e => {
                        onChange(e);
                        onValueChange(e.target.value as string);
                    }}
                    MenuProps={{
                        getContentAnchorEl: null,
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                    }}
                >
                    {!hideEmpty && (
                        <MenuItem value={""}>{emptyLabel ?? i18n.t("<No value>")}</MenuItem>
                    )}
                    {items.map(element => (
                        <MenuItem key={`element-${element.id}`} value={element.id}>
                            {element.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </MuiThemeProvider>
    );
};

export default Dropdown;
