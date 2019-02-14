import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import Paper from "@material-ui/core/Paper";
import FontIcon from "material-ui/FontIcon";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const styles = theme => ({
    root: {
        display: "flex",
    },
});

class LandingPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    onClick = key => {
        console.log("TODO", "clicked", key);
    };

    render() {
        const { classes } = this.props;
        const items = [
            ["instance-configurator", i18n.t("Instance Configurator"), "edit"],
            ["organisationUnits-sync", i18n.t("Organisation Units Sync"), "sync"],
            ["dataElements-sync", i18n.t("Data Elements Sync"), "sync"],
            ["indicators-sync", i18n.t("Indicators Sync"), "sync"],
            ["validationRules-sync", i18n.t("Validation Rules Sync"), "sync"],
            ["synchronization-rules", i18n.t("Synchronization Rules"), "playlist_add_check"],
            ["notifications", i18n.t("Notifications"), "settings"],
        ];
        const menuItems = items.map(([key, title, icon]) => (
            <MenuItem
                key={key}
                data-test={`page-${key}`}
                onClick={this.onClick.bind(this, key)}
                component={Link}
                to={`/${key}`}
            >
                <FontIcon className="material-icons">{icon}</FontIcon>
                {title}
            </MenuItem>
        ));

        return (
            <div className={classes.root}>
                <Paper>
                    <MenuList data-test="pages">{menuItems}</MenuList>
                </Paper>
            </div>
        );
    }
}

export default withStyles(styles)(LandingPage);
