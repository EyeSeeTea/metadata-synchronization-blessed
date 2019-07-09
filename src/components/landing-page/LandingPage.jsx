import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import Paper from "@material-ui/core/Paper";
import FontIcon from "material-ui/FontIcon";
import { withStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";

const styles = () => ({
    root: {
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
    },
    listItem: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
        "&:hover": {
            backgroundColor: "#f9f9f9",
        },
        cursor: "pointer",
        padding: 50,
    },
    container: {
        width: "90%",
        padding: 10,
    },
    item: {
        padding: 20,
    },
    title: {
        marginLeft: 10,
    },
    icons: {
        fontSize: "70px !important",
        marginRight: 10,
    },
});

const GRID_ITEM_BIG = 12;
const GRID_ITEM_MEDIUM = 6;
const GRID_ITEM_SMALL = 3;

class LandingPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { classes } = this.props;
        const items = [
            ["instance-configurator", i18n.t("Instance Configuration"), "edit", GRID_ITEM_BIG],
            ["sync/organisationUnits", i18n.t("Organisation Units"), "sync", GRID_ITEM_SMALL],
            ["sync/dataElements", i18n.t("Data Elements"), "sync", GRID_ITEM_SMALL],
            ["sync/indicators", i18n.t("Indicators"), "sync", GRID_ITEM_SMALL],
            ["sync/validationRules", i18n.t("Validation Rules"), "sync", GRID_ITEM_SMALL],
            [
                "synchronization-rules",
                i18n.t("Synchronization Rules"),
                "playlist_add_check",
                GRID_ITEM_MEDIUM,
            ],
            ["notifications", i18n.t("Synchronization History"), "history", GRID_ITEM_MEDIUM],
        ];
        const menuItems = items.map(([key, title, icon, xs]) => (
            <Grid item xs={xs} className={classes.item} key={key}>
                <Paper className={classes.paper}>
                    <ListItem
                        data-test={`page-${key}`}
                        component={Link}
                        to={`/${key}`}
                        className={classes.listItem}
                    >
                        <FontIcon className={`material-icons ${classes.icons}`}>{icon}</FontIcon>
                        <Typography className={classes.title} variant="h5">
                            {title}
                        </Typography>
                    </ListItem>
                </Paper>
            </Grid>
        ));

        return (
            <div className={classes.root}>
                <Grid container spacing={16} data-test="pages" className={classes.container}>
                    {menuItems}
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(LandingPage);
