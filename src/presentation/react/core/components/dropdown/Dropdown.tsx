import { FormControl, InputLabel, MenuItem, MuiThemeProvider, Select } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import _ from "lodash";
import i18n from "../../../../../locales";
import { muiTheme } from "../../themes/dhis2.theme";

export interface DropdownOption<T extends string = string> {
    id: T;
    name: string;
}

export type DropdownViewOption = "filter" | "inline" | "full-width";

interface DropdownProps<T extends string = string> {
    items: DropdownOption<T>[];
    value: string;
    label?: string;
    onChange?: Function;
    onValueChange?(value: T): void;
    hideEmpty?: boolean;
    emptyLabel?: string;
    view?: DropdownViewOption;
    disabled?: boolean;
}

const getTheme = (view: DropdownViewOption) => {
    switch (view) {
        case "filter":
            return createTheme({
                ...muiTheme,
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
        case "inline":
            return createTheme({
                ...muiTheme,
                overrides: {
                    MuiFormControl: {
                        root: {
                            verticalAlign: "middle",
                            marginBottom: 5,
                        },
                    },
                },
            });
        default:
            return {};
    }
};

export function Dropdown<T extends string = string>({
    items,
    value,
    onChange = _.noop,
    onValueChange = _.noop,
    label,
    hideEmpty = false,
    emptyLabel,
    view = "filter",
    disabled = false,
}: DropdownProps<T>) {
    const inlineStyles = { minWidth: 120, paddingLeft: 25, paddingRight: 25 };
    const styles = view === "inline" ? inlineStyles : {};

    return (
        <MuiThemeProvider theme={getTheme(view)}>
            <FormControl fullWidth={view === "full-width"}>
                {view !== "inline" && label && <InputLabel>{label}</InputLabel>}
                <Select
                    key={`dropdown-select-${label}`}
                    disableUnderline={view === "inline"}
                    value={value}
                    onChange={e => {
                        onChange(e);
                        onValueChange(e.target.value as T);
                    }}
                    MenuProps={{
                        getContentAnchorEl: null,
                        anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                        },
                    }}
                    style={styles}
                    disabled={disabled}
                >
                    {!hideEmpty && <MenuItem value={""}>{emptyLabel ?? i18n.t("<No value>")}</MenuItem>}
                    {items.map(element => (
                        <MenuItem key={`element-${element.id}`} value={element.id}>
                            {element.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </MuiThemeProvider>
    );
}

export default Dropdown;
