import i18n from "@dhis2/d2-i18n";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuList from "@material-ui/core/MenuList";
import Popover from "@material-ui/core/Popover";
import { withStyles } from "@material-ui/core/styles";
import CreateIcon from "@material-ui/icons/Create";
import NotInterestedIcon from "@material-ui/icons/NotInterested";
import VisibilityIcon from "@material-ui/icons/Visibility";
import PropTypes from "prop-types";
import React, { Component, Fragment } from "react";
import PermissionOption from "./PermissionOption";

const styles = {
    optionHeader: {
        paddingLeft: 16,
        paddingTop: 16,
        fontWeight: "500",
        color: "gray",
    },
};

const AccessIcon = ({ metaAccess, disabled }) => {
    const iconProps = {
        color: disabled ? "disabled" : "action",
    };
    if (metaAccess.canEdit) {
        return <CreateIcon {...iconProps} />;
    }

    return metaAccess.canView ? (
        <VisibilityIcon {...iconProps} />
    ) : (
        <NotInterestedIcon {...iconProps} />
    );
};

class PermissionPicker extends Component {
    state = {
        open: false,
    };

    onOptionClick = access => () => {
        const newAccess = {
            ...this.props.access,
            ...access,
        };

        this.props.onChange(newAccess);
    };

    openMenu = event => {
        event.preventDefault();
        this.setState({
            open: true,
            anchor: event.currentTarget,
        });
    };

    closeMenu = () => {
        this.setState({
            open: false,
        });
    };

    render = () => {
        const { data, meta } = this.props.access;
        const { data: dataOptions, meta: metaOptions } = this.props.accessOptions;

        return (
            <Fragment>
                <IconButton onClick={this.openMenu} disabled={this.props.disabled}>
                    <AccessIcon metaAccess={meta} disabled={this.props.disabled} />
                </IconButton>
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchor}
                    onClose={this.closeMenu}
                >
                    <OptionHeader text={i18n.t("METADATA")} />
                    <MenuList>
                        <PermissionOption
                            disabled={!metaOptions.canEdit}
                            primaryText={i18n.t("Can edit and view")}
                            isSelected={meta.canEdit}
                            onClick={this.onOptionClick({ meta: { canView: true, canEdit: true } })}
                        />
                        <PermissionOption
                            disabled={!metaOptions.canView}
                            primaryText={i18n.t("Can view only")}
                            isSelected={!meta.canEdit && meta.canView}
                            onClick={this.onOptionClick({
                                meta: { canView: true, canEdit: false },
                            })}
                        />
                        <PermissionOption
                            disabled={!metaOptions.noAccess}
                            primaryText={i18n.t("No access")}
                            isSelected={!meta.canEdit && !meta.canView}
                            onClick={this.onOptionClick({
                                meta: { canView: false, canEdit: false },
                            })}
                        />
                    </MenuList>
                    <Divider />

                    {dataOptions && (
                        <Fragment>
                            <OptionHeader text={i18n.t("DATA")} />
                            <MenuList>
                                <PermissionOption
                                    disabled={!dataOptions.canEdit}
                                    primaryText={i18n.t("Can capture and view")}
                                    isSelected={data.canEdit}
                                    onClick={this.onOptionClick({
                                        data: { canView: true, canEdit: true },
                                    })}
                                />
                                <PermissionOption
                                    disabled={!dataOptions.canView}
                                    primaryText={i18n.t("Can view only")}
                                    isSelected={!data.canEdit && data.canView}
                                    onClick={this.onOptionClick({
                                        data: { canView: true, canEdit: false },
                                    })}
                                />
                                <PermissionOption
                                    disabled={!dataOptions.noAccess}
                                    primaryText={i18n.t("No access")}
                                    isSelected={!data.canEdit && !data.canView}
                                    onClick={this.onOptionClick({
                                        data: {
                                            canView: false,
                                            canEdit: false,
                                        },
                                    })}
                                />
                            </MenuList>
                        </Fragment>
                    )}
                </Popover>
            </Fragment>
        );
    };
}

PermissionPicker.propTypes = {
    access: PropTypes.object.isRequired,
    accessOptions: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

PermissionPicker.defaultProps = {
    disabled: false,
};

const OptionHeader = withStyles(styles)(({ text, classes }) => (
    <div className={classes.optionHeader}>{text.toUpperCase()}</div>
));

OptionHeader.propTypes = {
    text: PropTypes.string.isRequired,
};

export default PermissionPicker;
