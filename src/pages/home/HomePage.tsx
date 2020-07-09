import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Landing } from "../../components/landing/Landing";
import { MenuCardProps } from "../../components/landing/MenuCard";
import { TestWrapper } from "../../components/test-wrapper/TestWrapper";
import { isAppConfigurator, shouldShowDeletedObjects } from "../../utils/permissions";

const LandingPage: React.FC = () => {
    const api = useD2Api();
    const history = useHistory();
    const [showDeletedObjects, setShowDeletedObjects] = useState(false);
    const [appConfigurator, setAppConfigurator] = useState(false);

    useEffect(() => {
        shouldShowDeletedObjects(api).then(setShowDeletedObjects);
        isAppConfigurator(api).then(setAppConfigurator);
    }, [api]);

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
                    isVisible: appConfigurator,
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
                    addAction: appConfigurator
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
                    isVisible: appConfigurator,
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
                    addAction: appConfigurator
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
                    isVisible: appConfigurator,
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
                    addAction: appConfigurator
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
            isVisible: appConfigurator,
            children: [
                {
                    name: i18n.t("Destination instance settings"),
                    description: i18n.t(
                        "Create, check connectivity, modify and delete DHIS2 destination instances. Map metadata objects between instances."
                    ),
                    addAction: appConfigurator ? () => history.push("/instances/new") : undefined,
                    listAction: () => history.push("/instances"),
                },
            ],
        },
    ];

    return (
        <TestWrapper>
            <Landing cards={cards} />
        </TestWrapper>
    );
};

export default LandingPage;
