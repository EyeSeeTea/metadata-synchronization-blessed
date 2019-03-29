import React from "react";
import PropTypes from "prop-types";
import { Select, MenuItem } from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core";
import cyan from "@material-ui/core/colors/cyan";

const getMaterialTheme = textColor =>
    createMuiTheme({
        typography: {
            useNextVariants: true,
        },
        overrides: {
            MuiFormLabel: {
                root: {
                    color: "#aaaaaa",
                    "&$focused": {
                        color: cyan["500"],
                    },
                },
            },
            MuiInput: {
                root: {
                    marginTop: 8,
                    marginLeft: 10,
                },
                input: {
                    color: textColor,
                },
                underline: {
                    "&&&&:hover:before": {
                        borderBottom: `1px solid #e0e0e0`,
                    },
                    "&:hover:not($disabled):before": {
                        borderBottom: `1px solid #aaaaaa`,
                    },
                    "&:after": {
                        borderBottom: `2px solid ${cyan["500"]}`,
                    },
                    "&:before": {
                        borderBottom: `1px solid #e0e0e0`,
                    },
                },
            },
        },
    });

export default function Dropdown({ items, value, onChange, placeholder }) {
    const textColor = value ? "#565656" : "#aaaaaa";
    const materialTheme = getMaterialTheme(textColor);
    return (
        <MuiThemeProvider theme={materialTheme}>
            <Select value={value} onChange={onChange} displayEmpty>
                <MenuItem value={""} disabled>
                    {placeholder}
                </MenuItem>
                {items.map(i => (
                    <MenuItem key={i.id} value={i.id}>
                        {i.name}
                    </MenuItem>
                ))}
            </Select>
        </MuiThemeProvider>
    );
}

Dropdown.propTypes = {
    items: PropTypes.array.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};
