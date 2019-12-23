import i18n from "@dhis2/d2-i18n";
import { FormControl, InputLabel, MenuItem, MuiThemeProvider, Select } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

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

export default function Dropdown({
    items,
    value,
    onChange = _.noop,
    onValueChange = _.noop,
    label,
    hideEmpty,
    emptyLabel,
}) {
    const materialTheme = getMaterialTheme();
    return (
        <MuiThemeProvider theme={materialTheme}>
            <FormControl>
                <InputLabel>{label}</InputLabel>
                <Select
                    value={value}
                    onChange={e => {
                        onChange(e);
                        onValueChange(e.target.value);
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
                        <MenuItem value={""}>{emptyLabel || i18n.t("<No value>")}</MenuItem>
                    )}
                    {items.map((element, index) => (
                        <MenuItem key={`element-${index}`} value={element.id}>
                            {element.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </MuiThemeProvider>
    );
}

Dropdown.propTypes = {
    items: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onValueChange: PropTypes.func,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    hideEmpty: PropTypes.bool,
    emptyLabel: PropTypes.string,
};

Dropdown.defaultProps = {
    hideEmpty: false,
};
