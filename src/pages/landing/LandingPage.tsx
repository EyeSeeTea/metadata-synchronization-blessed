import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import React, { useMemo, useState, useEffect } from "react";
import MenuCards from "./MenuCards.component";
import { useD2 } from "d2-api";
import { shouldShowDeletedObjects } from "../../utils/permissions";
import { D2 } from "../../types/d2";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles({
    cardItem: {
        fontSize: 24,
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "16px 0px 5px",
        margin: 0,
    },
});

const LandingPage: React.FC = () => {
    const classes = useStyles();
    const d2 = useD2();
    const [showDeletedObjects, setShowDeletedObjects] = useState(false);
    const history = useHistory();

    useEffect(() => {
        shouldShowDeletedObjects(d2 as D2).then(setShowDeletedObjects);
    }, [d2]);

    const rows = [
        {
            title: "Destination instance settings",
            key: "instances",
            children: [
                {
                    name: i18n.t("Destination instances"),
                    description: i18n.t("Destination instance settings description"),
                    canCreate: true,
                    add: () => history.push("/instance-configurator/new"),
                    list: () => history.push("/instance-configurator"),
                },
            ],
        },
        {
            title: "Metadata sync",
            key: "metadata",
            children: [
                {
                    name: i18n.t("Manual sync"),
                    description: i18n.t("Metadata manual synchronization"),
                    list: () => history.push("/sync/metadata"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Metadata synchronization rules description"),
                    canCreate: true,
                    add: () => history.push("/sync-rules/metadata/new"),
                    list: () => history.push("/sync-rules/metadata"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("Metadata synchronization history"),
                    list: () => history.push("/history/metadata"),
                },
            ],
        },
        {
            title: "Aggregated Data Sync",
            key: "aggregated",
            children: [
                {
                    name: i18n.t("Manual sync"),
                    description: i18n.t("Aggregated Data manual synchronization"),
                    list: () => history.push("/sync/aggregated"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Aggregated Data synchronization rules description"),
                    canCreate: true,
                    add: () => history.push("/sync-rules/aggregated/new"),
                    list: () => history.push("/sync-rules/aggregated"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("Aggregated Data synchronization history"),
                    list: () => history.push("/history/aggregated"),
                },
            ],
        },
        {
            title: "Events Sync",
            key: "events",
            children: [
                {
                    name: i18n.t("Manual sync"),
                    description: i18n.t("Event manual synchronization"),
                    list: () => history.push("/sync/events"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Event synchronization rules description"),
                    canCreate: true,
                    add: () => history.push("/sync-rules/events/new"),
                    list: () => history.push("/sync-rules/events"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("events synchronization history"),
                    list: () => history.push("/history/events"),
                },
            ],
        },
    ];

    if (showDeletedObjects) {
        rows.push({
            title: "Other",
            key: "other",
            children: [
                {
                    name: i18n.t("Deleted objects"),
                    description: i18n.t("List & Sync deleted objects"),
                    list: () => history.push("/sync/deleted"),
                },
            ],
        });
    }

    const menuItems = useMemo(
        () =>
            rows.map(row => (
                <div>
                    <div key={row.title}>
                        <h1 className={classes.cardItem}>{row.title}</h1>
                        <MenuCards menuItems={row.children} />
                    </div>
                </div>
            )),
        [rows, classes]
    );

    return <div>{menuItems}</div>;
};

export default LandingPage;
