import React from "react";
import { HashRouter, Redirect, Switch } from "react-router-dom";
import { SynchronizationType } from "../../domain/synchronization/entities/SynchronizationType";
import * as permissions from "../../utils/permissions";
import RouteWithSession from "../react/core/components/auth/RouteWithSession";
import RouteWithSessionAndAuth from "../react/core/components/auth/RouteWithSessionAndAuth";
import { useAppContext } from "../react/core/contexts/AppContext";
import { HistoryPage } from "./core/pages/history/HistoryPage";
import HomePage from "./core/pages/home/HomePage";
import InstanceCreationPage from "./core/pages/instance-creation/InstanceCreationPage";
import InstanceListPage from "./core/pages/instance-list/InstanceListPage";
import InstanceMappingLandingPage from "./core/pages/instance-mapping/InstanceMappingLandingPage";
import InstanceMappingPage from "./core/pages/instance-mapping/InstanceMappingPage";
import ManualSyncPage from "./core/pages/manual-sync/ManualSyncPage";
import ModulePackageListPage from "./core/pages/module-package-list/ModulePackageListPage";
import ModuleCreationPage from "./core/pages/modules-creation/ModuleCreationPage";
import NotificationsListPage from "./core/pages/notifications-list/NotificationsListPage";
import ResponsiblesListPage from "./core/pages/responsibles-list/ResponsiblesListPage";
import { SettingsPage } from "./core/pages/settings/SettingsPage";
import StoreCreationPage from "./core/pages/store-creation/StoreCreationPage";
import StoreListPage from "./core/pages/store-list/StoreListPage";
import SyncRulesCreationPage, { SyncRulesCreationParams } from "./core/pages/sync-rules-creation/SyncRulesCreationPage";
import { SyncRulesListPage } from "./core/pages/sync-rules-list/SyncRulesListPage";
import { MSFHistoryPage } from "./msf-aggregate-data/pages/MSFHistoryPage";
import { MSFHomePage } from "./msf-aggregate-data/pages/MSFHomePage";

const Root: React.FC = () => {
    const { api, compositionRoot } = useAppContext();
    const appVariant = getAppVariant();

    return (
        <HashRouter>
            <Switch>
                <RouteWithSession
                    path={"/instances/mapping/:id/:section(aggregated|tracker|orgUnit|global)"}
                    render={() => <InstanceMappingPage />}
                />

                <RouteWithSession path={"/instances/mapping/:id"} render={() => <InstanceMappingLandingPage />} />

                <RouteWithSession path={"/instances/:action(new|edit)/:id?"} render={() => <InstanceCreationPage />} />

                <RouteWithSession path="/instances" render={() => <InstanceListPage />} />

                <RouteWithSessionAndAuth
                    path="/sync/:type(metadata|aggregated|events|deleted)"
                    authorize={async props => {
                        const { type } = props.match.params as { type: SynchronizationType };
                        return type !== "deleted" || permissions.shouldShowDeletedObjects(api);
                    }}
                    render={() => <ManualSyncPage />}
                />

                <RouteWithSessionAndAuth
                    path={"/sync-rules/:type(metadata|aggregated|events)/:action(new|edit)/:id?"}
                    authorize={async props => {
                        const { id } = props.match.params as SyncRulesCreationParams;
                        const syncRule = await compositionRoot.rules.get(id);

                        return permissions.verifyUserHasAccessToSyncRule(api, syncRule);
                    }}
                    render={() => <SyncRulesCreationPage />}
                />

                <RouteWithSession
                    path="/sync-rules/:type(metadata|aggregated|events)"
                    render={() => <SyncRulesListPage />}
                />

                <RouteWithSession
                    path="/history/:type(metadata|aggregated|events)/:id?"
                    render={() => <HistoryPage />}
                />

                <RouteWithSession path={"/modules/:action(new|edit)/:id?"} render={() => <ModuleCreationPage />} />

                <RouteWithSession path={"/stores/:action(new|edit)/:id?"} render={() => <StoreCreationPage />} />

                <RouteWithSession path="/stores" render={() => <StoreListPage />} />

                <RouteWithSession path="/:list(modules|packages)" render={() => <ModulePackageListPage />} />

                <RouteWithSession path="/custodians" render={() => <ResponsiblesListPage />} />

                <RouteWithSession path="/notifications/:id?" render={() => <NotificationsListPage />} />

                <RouteWithSession path="/settings" render={() => <SettingsPage />} />

                <VariantRoutes variant={appVariant} />
            </Switch>
        </HashRouter>
    );
};

const VariantRoutes: React.FC<{ variant: AppVariant }> = ({ variant }) => {
    switch (variant) {
        case "msf-aggregate-data-app":
            return (
                <Switch>
                    <RouteWithSession path="/msf" exact render={() => <MSFHomePage />} />

                    <RouteWithSession path="/msf/history" render={() => <MSFHistoryPage />} />

                    <RouteWithSession path={"/dashboard"} render={() => <HomePage type={"dashboard"} />} />

                    <Redirect to="/msf" />
                </Switch>
            );
        default:
            return (
                <Switch>
                    <RouteWithSession path={"/dashboard"} render={() => <HomePage type={"home"} />} />

                    <Redirect to="/dashboard" />
                </Switch>
            );
    }
};

const getAppVariant = (): AppVariant => {
    const variant = process.env.REACT_APP_PRESENTATION_VARIANT;

    return isAppVariant(variant) ? variant : "core-app";
};

const isAppVariant = (variant?: string): variant is AppVariant => {
    return (
        !!variant && ["core-app", "data-metadata-app", "module-package-app", "msf-aggregate-data-app"].includes(variant)
    );
};

export type AppVariant = "core-app" | "data-metadata-app" | "module-package-app" | "msf-aggregate-data-app";

export default Root;
