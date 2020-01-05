import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import { useD2 } from "d2-api";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { D2 } from "../../types/d2";
import { isAppConfigurator, shouldShowDeletedObjects } from "../../utils/permissions";
import MenuCard, { MenuCardProps } from "./MenuCard";

const useStyles = makeStyles({
    container: {
        marginLeft: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "15px 0px 15px",
        margin: 0,
    },
    clear: {
        clear: "both",
    },
});

const LandingPage: React.FC = () => {
    const d2 = useD2();
    const classes = useStyles();
    const history = useHistory();
    const [showDeletedObjects, setShowDeletedObjects] = useState(false);
    const [showCreateLinks, setShowCreateLinks] = useState(false);

    useEffect(() => {
        shouldShowDeletedObjects(d2 as D2).then(setShowDeletedObjects);
        isAppConfigurator(d2 as D2).then(setShowCreateLinks);
    }, [d2]);

    const cards: {
        title: string;
        key: string;
        isVisible?: boolean;
        children: MenuCardProps[];
    }[] = [
        {
            title: "Aggregated Data Sync",
            key: "aggregated",
            children: [
                {
                    name: i18n.t("Manual sync"),
                    description: i18n.t(
                        "Manually synchronise aggregated data by selecting the data sets, data elements or their groups and group sets together with the organisation unit, period and category options."
                    ),
                    listAction: () => history.push("/sync/aggregated"),
                },
                {
                    name: i18n.t("Sync rules"),
                    description: i18n.t(
                        "Create, modify, delete, execute and schedule sync rules for aggregated data by selecting the data sets, data elements or their groups and group sets together with the organisation unit, period and category options."
                    ),
                    addAction: showCreateLinks
                        ? () => history.push("/sync-rules/aggregated/new")
                        : undefined,
                    listAction: () => history.push("/sync-rules/aggregated"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t(
                        "View and analyse the status and results of the aggregated data manual syncs and sync rules executions."
                    ),
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
                    description: i18n.t(
                        "Manually synchronise events by selecting the programs or events together with the organisation unit, period and category options."
                    ),
                    listAction: () => history.push("/sync/events"),
                },
                {
                    name: i18n.t("Sync rules"),
                    description: i18n.t(
                        "Create, modify, delete, execute and schedule sync rules for events by selecting the programs or events together with the organisation unit, period and category options."
                    ),
                    addAction: showCreateLinks
                        ? () => history.push("/sync-rules/events/new")
                        : undefined,
                    listAction: () => history.push("/sync-rules/events"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t(
                        "View and analyse the status and results of the event manual syncs and sync rules executions."
                    ),
                    listAction: () => history.push("/history/events"),
                },
            ],
        },
        {
            title: "Metadata Sync",
            key: "metadata",
            children: [
                {
                    name: i18n.t("Manual sync"),
                    description: i18n.t(
                        "Manually synchronise metadata like data elements, organisation units and program indicators and groups and group sets."
                    ),
                    listAction: () => history.push("/sync/metadata"),
                },
                {
                    name: i18n.t("Sync rules"),
                    description: i18n.t(
                        "Create, modify, delete, execute and schedule sync rules for metadata like data elements, organisation units and program indicators and groups and group sets."
                    ),
                    addAction: showCreateLinks
                        ? () => history.push("/sync-rules/metadata/new")
                        : undefined,
                    listAction: () => history.push("/sync-rules/metadata"),
                },
                {
                    name: i18n.t("History"),
                    description: i18n.t(
                        "View and analyse the status and results of the metadata manual syncs and sync rules executions."
                    ),
                    listAction: () => history.push("/history/metadata"),
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
                    description: i18n.t("Manually synchronise deleted objects."),
                    listAction: () => history.push("/sync/deleted"),
                },
            ],
        },
        {
            title: "Configuration",
            key: "configuration",
            children: [
                {
                    name: i18n.t("Destination instance settings"),
                    description: i18n.t(
                        "Create, check connectivity, modify and delete DHIS2 destination instances. Map metadata objects between instances."
                    ),
                    addAction: showCreateLinks ? () => history.push("/instances/new") : undefined,
                    listAction: () => history.push("/instances"),
                },
            ],
        },
    ];

    return (
        <TestWrapper>
            <div className={classes.container} key="pages">
                {cards.map(
                    ({ key, title, isVisible = true, children }) =>
                        isVisible && (
                            <div key={key}>
                                <h1 className={classes.title}>{title}</h1>

                                {children.map(props => (
                                    <MenuCard {...props} />
                                ))}

                                <div className={classes.clear} />
                            </div>
                        )
                )}
            </div>
        </TestWrapper>
    );
};

export default LandingPage;
