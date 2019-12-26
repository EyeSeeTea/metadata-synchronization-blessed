import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { useD2 } from "d2-api";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { D2 } from "../../types/d2";
import { shouldShowDeletedObjects } from "../../utils/permissions";
import MenuCard, { MenuCardProps } from "./MenuCard";

const useStyles = makeStyles({
    title: {
        fontSize: 24,
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "15px 0px 15px",
        margin: 0,
    },
});

const LandingPage: React.FC = () => {
    const d2 = useD2();
    const classes = useStyles();
    const history = useHistory();
    const [showDeletedObjects, setShowDeletedObjects] = useState(false);

    useEffect(() => {
        shouldShowDeletedObjects(d2 as D2).then(setShowDeletedObjects);
    }, [d2]);

    const cards: {
        title: string;
        key: string;
        isVisible?: boolean;
        children: MenuCardProps[];
    }[] = [
        {
            title: "Destination instance settings",
            key: "instances",
            children: [
                {
                    name: i18n.t("Destination instances"),
                    description: i18n.t("Destination instance settings description"),
                    addAction: () => history.push("/instance-configurator/new"),
                    listAction: () => history.push("/instance-configurator"),
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
                    listAction: () => history.push("/sync/metadata"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Metadata synchronization rules description"),
                    addAction: () => history.push("/sync-rules/metadata/new"),
                    listAction: () => history.push("/sync-rules/metadata"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("Metadata synchronization history"),
                    listAction: () => history.push("/history/metadata"),
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
                    listAction: () => history.push("/sync/aggregated"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Aggregated Data synchronization rules description"),
                    addAction: () => history.push("/sync-rules/aggregated/new"),
                    listAction: () => history.push("/sync-rules/aggregated"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("Aggregated Data synchronization history"),
                    listAction: () => history.push("/history/aggregated"),
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
                    listAction: () => history.push("/sync/events"),
                },
                {
                    name: i18n.t("Sync Rules"),
                    description: i18n.t("Event synchronization rules description"),
                    addAction: () => history.push("/sync-rules/events/new"),
                    listAction: () => history.push("/sync-rules/events"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t("events synchronization history"),
                    listAction: () => history.push("/history/events"),
                },
            ],
        },
        {
            title: "Other",
            key: "other",
            isVisible: showDeletedObjects,
            children: [
                {
                    name: i18n.t("Deleted objects"),
                    description: i18n.t("List & Sync deleted objects"),
                    listAction: () => history.push("/sync/deleted"),
                },
            ],
        },
    ];

    return (
        <React.Fragment>
            {cards.map(
                ({ key, title, isVisible = true, children }) =>
                    isVisible && (
                        <div key={`card-${key}`}>
                            <h1 className={classes.title}>{title}</h1>

                            {children.map((props, index) => (
                                <MenuCard key={`card-${key}-${index}`} {...props} />
                            ))}

                            <div style={{ clear: "both" }} />
                        </div>
                    )
            )}
        </React.Fragment>
    );
};

export default LandingPage;
