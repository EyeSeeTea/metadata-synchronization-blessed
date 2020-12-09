import { Icon, ListItem, ListItemIcon, ListItemText, Menu, MenuItem } from "@material-ui/core";
import React, { useMemo, useState } from "react";
import i18n from "../../../../../../locales";

export const StorageSettingDropdown: React.FC = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedOption, setSelectedOption] = useState("dataStore");

    const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (key: string) => {
        setSelectedOption(key);
        setAnchorEl(null);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const options = useMemo(
        () => [
            { id: "dataStore", label: i18n.t("Data Store") },
            { id: "constant", label: i18n.t("Metadata constant") },
        ],
        []
    );

    return (
        <React.Fragment>
            <ListItem button onClick={handleClickListItem}>
                <ListItemIcon>
                    <Icon>storage</Icon>
                </ListItemIcon>
                <ListItemText
                    primary={i18n.t("Application storage")}
                    secondary={options.find(option => option.id === selectedOption)?.label}
                />
            </ListItem>

            <Menu
                id="lock-menu"
                anchorEl={anchorEl}
                keepMounted
                open={!!anchorEl}
                onClose={handleClose}
            >
                {options.map(option => (
                    <MenuItem
                        key={option.id}
                        selected={option.id === selectedOption}
                        onClick={() => handleMenuItemClick(option.id)}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </React.Fragment>
    );
};
