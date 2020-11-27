import { Badge, Icon } from "@material-ui/core";
import _ from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import i18n from "../../../../locales";
import {
    isAppConfigurator,
    isAppExecutor,
    shouldShowDeletedObjects,
} from "../../../../utils/permissions";
import { useAppContext } from "../../../react/contexts/AppContext";
import { Card, Landing } from "../../../react/components/landing/Landing";
import { TestWrapper } from "../../../react/components/test-wrapper/TestWrapper";

export type AppVariant = "core-app" | "data-metadata-app" | "module-package-app";

const appVariantConfiguration: Record<AppVariant, string[]> = {
    "core-app": [
        "aggregated",
        "events",
        "metadata",
        "other",
        "metadata-distribution",
        "configuration",
    ],
    "data-metadata-app": ["aggregated", "events", "metadata", "other", "configuration"],
    "module-package-app": ["metadata-distribution", "configuration"],
};

const LandingPage: React.FC = () => {
    const appVariant = process.env.REACT_APP_PRESENTATION_VARIANT as AppVariant;

    const { api, compositionRoot } = useAppContext();
    const history = useHistory();

    const [showDeletedObjects, setShowDeletedObjects] = useState(false);
    const [appConfigurator, setAppConfigurator] = useState(false);
    const [appExecutor, setAppExecutor] = useState(false);
    const [pendingNotifications, setPendingNotifications] = useState(0);

    useEffect(() => {
        shouldShowDeletedObjects(api).then(setShowDeletedObjects);
        isAppConfigurator(api).then(setAppConfigurator);
        isAppExecutor(api).then(setAppExecutor);
        compositionRoot.notifications.list().then(notifications => {
            const unread = notifications.filter(({ read }) => !read).length;
            setPendingNotifications(unread);
        });
    }, [api, compositionRoot]);

    const allCards: Card[] = useMemo(
        () => [
            {
                title: i18n.t("Aggregated Data Sync"),
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
                            "Create, modify, delete, execute and schedule rules to synchronize aggregated data periodically."
                        ),
                        addAction: appConfigurator
                            ? () => history.push("/sync-rules/aggregated/new")
                            : undefined,
                        listAction: () => history.push("/sync-rules/aggregated"),
                    },
                    {
                        name: i18n.t("History"),
                        description: i18n.t(
                            "View and analyse the outcome of aggregated data manual syncs and executions of sync rules."
                        ),
                        listAction: () => history.push("/history/aggregated"),
                    },
                ],
            },
            {
                title: i18n.t("Events Sync"),
                key: "events",
                children: [
                    {
                        isVisible: appConfigurator,
                        name: i18n.t("Manual sync"),
                        description: i18n.t(
                            "Manually synchronise event data by selecting the programs or events together with the organisation unit, period and category options."
                        ),
                        listAction: () => history.push("/sync/events"),
                    },
                    {
                        name: i18n.t("Sync rules"),
                        description: i18n.t(
                            "Create, modify, delete, execute and schedule rules to synchronize event data periodically."
                        ),
                        addAction: appConfigurator
                            ? () => history.push("/sync-rules/events/new")
                            : undefined,
                        listAction: () => history.push("/sync-rules/events"),
                    },
                    {
                        name: i18n.t("History"),
                        description: i18n.t(
                            "View and analyse the outcome of events manual syncs and executions of sync rules."
                        ),
                        listAction: () => history.push("/history/events"),
                    },
                ],
            },
            {
                title: i18n.t("Metadata Sync"),
                key: "metadata",
                children: [
                    {
                        isVisible: appConfigurator,
                        name: i18n.t("Manual sync"),
                        description: i18n.t(
                            "Manually synchronise metadata such as data elements, organisation units, options, indicators, program indicator, categories and their groups and group sets."
                        ),
                        listAction: () => history.push("/sync/metadata"),
                    },
                    {
                        name: i18n.t("Sync rules"),
                        description: i18n.t(
                            "Create, modify, delete, execute and schedule rules to synchronize metadata periodically."
                        ),
                        addAction: appConfigurator
                            ? () => history.push("/sync-rules/metadata/new")
                            : undefined,
                        listAction: () => history.push("/sync-rules/metadata"),
                    },
                    {
                        name: i18n.t("History"),
                        description: i18n.t(
                            "View and analyse the outcome of metadata manual syncs and executions of sync rules."
                        ),
                        listAction: () => history.push("/history/metadata"),
                    },
                    {
                        name: i18n.t("Notifications"),
                        description: i18n.t(
                            "Read notifications regarding new versions of DHIS2 metadata packages."
                        ),
                        icon:
                            pendingNotifications > 0 ? (
                                <Badge badgeContent={pendingNotifications} color="secondary">
                                    <Icon>mail</Icon>
                                </Badge>
                            ) : undefined,
                        listAction: () => history.push("/notifications"),
                    },
                ],
            },
            {
                title: i18n.t("Other"),
                key: "other",
                children: _.compact([
                    {
                        isVisible: showDeletedObjects,
                        name: i18n.t("Deleted objects"),
                        description: i18n.t("Manually synchronise deleted objects."),
                        listAction: () => history.push("/sync/deleted"),
                    },
                ]),
            },
            {
                title: i18n.t("Metadata distribution"),
                key: "metadata-distribution",
                children: _.compact([
                    {
                        name: i18n.t("Modules"),
                        description: i18n.t(
                            "Create, edit and delete modules from this instance metadata."
                        ),
                        isVisible: appConfigurator,
                        addAction: () => history.push("/modules/new"),
                        listAction: () => history.push("/modules"),
                    },
                    {
                        name: i18n.t("Packages"),
                        description: i18n.t(
                            "View, publish, download and delete metadata packages from this instance metadata modules."
                        ),
                        isVisible: appConfigurator || appExecutor,
                        listAction: () => history.push("/packages"),
                    },
                    {
                        name: i18n.t("Package store connection"),
                        description: i18n.t("Configure connections to metadata package stores."),
                        isVisible: appConfigurator,
                        addAction: () => history.push("/stores/new"),
                        listAction: () => history.push("/stores"),
                    },
                ]),
            },
            {
                title: i18n.t("Configuration"),
                key: "configuration",
                isVisible: appConfigurator,
                children: [
                    {
                        name: i18n.t("Instance settings"),
                        description: i18n.t(
                            "Configure, test and edit connections to other DHIS2 and map metadata objects between instances."
                        ),
                        addAction: appConfigurator
                            ? () => history.push("/instances/new")
                            : undefined,
                        listAction: () => history.push("/instances"),
                    },
                    {
                        isVisible: appConfigurator,
                        name: i18n.t("Metadata custodians"),
                        description: i18n.t(
                            "Define who are the custodians of this instance metadata. Custodians approve metadata requests coming from other DHIS instances."
                        ),
                        listAction: () => history.push("/custodians"),
                    },
                ],
            },
        ],
        [appConfigurator, appExecutor, history, pendingNotifications, showDeletedObjects]
    );

    return (
        <TestWrapper>
            <Landing
                cards={allCards.filter(card =>
                    appVariantConfiguration[appVariant].includes(card.key)
                )}
            />
        </TestWrapper>
    );
};

export default LandingPage;
