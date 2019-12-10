import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import ListItem from "@material-ui/core/ListItem";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import _ from "lodash";
import FontIcon from "@material-ui/core/Icon";
import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useD2 } from "d2-api";
import { shouldShowDeletedObjects } from "../../utils/permissions";
import { D2 } from "../../types/d2";

const useStyles = makeStyles({
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
        padding: 45,
        height: "100%",
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
        color: "#000000",
    },
    icons: {
        fontSize: "70px !important",
        marginRight: 10,
        color: "#000000",
    },
    paper: {
        height: "100%",
    },
});

const LandingPage: React.FC = () => {
    const classes = useStyles();
    const d2 = useD2();
    const [showDeletedObjects, setShowDeletedObjects] = useState(false);

    useEffect(() => {
        shouldShowDeletedObjects(d2 as D2).then(setShowDeletedObjects);
    }, [d2]);

    const rows = [
        [
            {
                key: "instance-configurator",
                title: i18n.t("Instance Configuration"),
                icon: "edit",
            },
        ],
        [
            { key: "sync/metadata", title: i18n.t("Metadata Synchronization"), icon: "sync" },
            {
                key: "sync/aggregated",
                title: i18n.t("Aggregated Synchronization"),
                icon: "sync",
            },
            {
                key: "sync/events",
                title: i18n.t("Events Synchronization"),
                icon: "sync",
            },
        ],
        [
            {
                key: "sync-rules/metadata",
                title: i18n.t("Metadata Synchronization Rules"),
                icon: "playlist_add_check",
            },
            {
                key: "sync-rules/aggregated",
                title: i18n.t("Aggregated Synchronization Rules"),
                icon: "playlist_add_check",
            },
            {
                key: "sync-rules/events",
                title: i18n.t("Events Synchronization Rules"),
                icon: "playlist_add_check",
            },
        ],
        [
            {
                key: "history/metadata",
                title: i18n.t("Metadata Synchronization History"),
                icon: "history",
            },
            {
                key: "history/aggregated",
                title: i18n.t("Aggregated Synchronization History"),
                icon: "history",
            },
            {
                key: "history/events",
                title: i18n.t("Events Synchronization History"),
                icon: "history",
            },
        ],
        [
            showDeletedObjects && {
                key: "sync/deleted",
                title: i18n.t("Deleted objects"),
                icon: "delete",
            },
        ],
    ];

    const menuItems = useMemo(
        () =>
            rows.map(items =>
                _(items)
                    .compact()
                    .map(({ key, title, icon }, _index, collection) => (
                        <Grid
                            item
                            xs={(12 / collection.length) as 12 | 6 | 4 | 3}
                            className={classes.item}
                            key={key}
                        >
                            <Paper elevation={2} className={classes.paper}>
                                <ListItem
                                    data-test={`page-${key}`}
                                    component={Link}
                                    to={`/${key}`}
                                    className={classes.listItem}
                                >
                                    <FontIcon className={classes.icons}>{icon}</FontIcon>
                                    <Typography className={classes.title} variant="h5">
                                        {title}
                                    </Typography>
                                </ListItem>
                            </Paper>
                        </Grid>
                    ))
                    .value()
            ),
        [rows, classes]
    );

    return (
        <div className={classes.root}>
            <Grid container spacing={2} data-test="pages" className={classes.container}>
                {menuItems}
            </Grid>
        </div>
    );
};

export default LandingPage;
