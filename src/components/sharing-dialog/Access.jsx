import React from "react";
import PropTypes from "prop-types";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import PersonIcon from "@material-ui/icons/Person";
import GroupIcon from "@material-ui/icons/Group";
import PublicIcon from "@material-ui/icons/Public";
import BusinessIcon from "@material-ui/icons/Business";
import { withStyles } from "@material-ui/core/styles";
import i18n from "@dhis2/d2-i18n";

import PermissionPicker from "./PermissionPicker";
import { accessStringToObject, accessObjectToString } from "./utils";

const icons = {
    user: PersonIcon,
    userGroup: GroupIcon,
    external: PublicIcon,
    public: BusinessIcon,
};

const SvgIcon = ({ userType }) => {
    const Icon = icons[userType] || PersonIcon;

    return <Icon color="action" />;
};

SvgIcon.propTypes = {
    userType: PropTypes.string.isRequired,
};

const styles = {
    accessView: {
        fontWeight: "400",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 8px",
    },
    accessDescription: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        paddingLeft: 16,
    },
};

const useAccessObjectFormat = props => ({
    ...props,
    access: accessStringToObject(props.access),
    onChange: newAccess => props.onChange(accessObjectToString(newAccess)),
});

export const Access = withStyles(styles)(
    ({
        access,
        accessType,
        accessOptions,
        primaryText,
        secondaryText,
        onChange,
        onRemove,
        disabled,
        classes,
    }) => (
        <div className={classes.accessView}>
            <SvgIcon userType={accessType} />
            <div className={classes.accessDescription}>
                <div>{primaryText}</div>
                <div style={{ color: "#818181", paddingTop: 4 }}>{secondaryText || " "}</div>
            </div>
            <PermissionPicker
                access={access}
                accessOptions={accessOptions}
                onChange={onChange}
                disabled={disabled}
            />
            <IconButton disabled={!onRemove} onClick={onRemove || (() => {})}>
                <ClearIcon color={!onRemove ? "disabled" : "action"} />
            </IconButton>
        </div>
    )
);

Access.propTypes = {
    access: PropTypes.object.isRequired,
    accessType: PropTypes.string.isRequired,
    accessOptions: PropTypes.object.isRequired,
    primaryText: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    secondaryText: PropTypes.string,
    onRemove: PropTypes.func,
};

Access.defaultProps = {
    secondaryText: undefined,
    onRemove: undefined,
    disabled: false,
};

export const GroupAccess = basicProps => {
    const props = useAccessObjectFormat(basicProps);
    const newProps = {
        accessType: props.groupType,
        primaryText: props.groupName,
        accessOptions: {
            meta: { canView: true, canEdit: true, noAccess: false },
            data: props.dataShareable && {
                canView: true,
                canEdit: true,
                noAccess: true,
            },
        },
    };

    return <Access {...props} {...newProps} />;
};

export const ExternalAccess = props => {
    const newProps = {
        ...props,
        accessType: "external",
        primaryText: i18n.t("External access"),
        secondaryText: props.access ? i18n.t("Anyone can view without login") : i18n.t("No access"),
        access: {
            meta: { canEdit: false, canView: props.access },
            data: { canEdit: false, canView: false },
        },
        onChange: newAccess => props.onChange(newAccess.meta.canView),
        accessOptions: {
            meta: { canView: true, canEdit: false, noAccess: true },
        },
    };

    return <Access {...props} {...newProps} />;
};

export const PublicAccess = basicProps => {
    const props = useAccessObjectFormat(basicProps);
    const { canEdit, canView } = props.access.meta;
    const description = canEdit
        ? "Anyone can find and view"
        : canView
        ? "Anyone can view"
        : "No access";

    const newProps = {
        ...props,
        accessType: "public",
        primaryText: i18n.t("Public access"),
        secondaryText: description,
        accessOptions: {
            meta: { canView: true, canEdit: true, noAccess: true },
            data: props.dataShareable && {
                canView: true,
                canEdit: true,
                noAccess: true,
            },
        },
    };

    return <Access {...props} {...newProps} />;
};
