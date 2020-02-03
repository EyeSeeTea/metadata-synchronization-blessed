import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import DoneIcon from "@material-ui/icons/Done";
import { makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles({
    permissionOptionIcon: {
        minWidth: 0,
        paddingRight: "inherit",
    },
});

const PermissionOption = props => {
    const classes = useStyles();

    if (props.disabled) {
        return null;
    }

    return (
        <MenuItem disabled={props.disabled} onClick={props.onClick} selected={props.isSelected}>
            {props.isSelected && (
                <ListItemIcon className={classes.permissionOptionIcon}>
                    <DoneIcon />
                </ListItemIcon>
            )}
            <ListItemText primary={props.primaryText} />
        </MenuItem>
    );
};

PermissionOption.propTypes = {
    disabled: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool,
    primaryText: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

PermissionOption.defaultProps = {
    isSelected: false,
};

export default PermissionOption;
