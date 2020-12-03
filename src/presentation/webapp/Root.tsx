import React from "react";
import { HashRouter, Switch } from "react-router-dom";
import RouteWithSession from "../react/core/components/auth/RouteWithSession";
import RouteWithSessionAndAuth from "../react/core/components/auth/RouteWithSessionAndAuth";
import InstanceCreationPage from "./core/pages/instance-creation/InstanceCreationPage";
import HistoryPage from "./core/pages/history/HistoryPage";
import InstanceListPage from "./core/pages/instance-list/InstanceListPage";
import InstanceMappingLandingPage from "./core/pages/instance-mapping/InstanceMappingLandingPage";
import InstanceMappingPage from "./core/pages/instance-mapping/InstanceMappingPage";
import ManualSyncPage from "./core/pages/manual-sync/ManualSyncPage";
import ModulePackageListPage from "./core/pages/module-package-list/ModulePackageListPage";
import ModuleCreationPage from "./core/pages/modules-creation/ModuleCreationPage";
import NotificationsListPage from "./core/pages/notifications-list/NotificationsListPage";
import ResponsiblesListPage from "./core/pages/responsibles-list/ResponsiblesListPage";
import StoreCreationPage from "./core/pages/store-creation/StoreCreationPage";
import StoreListPage from "./core/pages/store-list/StoreListPage";
import SyncRulesCreationPage, {
    SyncRulesCreationParams,
} from "./core/pages/sync-rules-creation/SyncRulesCreationPage";
import SyncRulesPage from "./core/pages/sync-rules-list/SyncRulesListPage";
import { SynchronizationType } from "../../domain/synchronization/entities/SynchronizationType";
import { useAppContext } from "../react/core/contexts/AppContext";
import * as permissions from "../../utils/permissions";
import HomePage from "./core/pages/home/HomePage";
import { MSFHomePage } from "./msf-aggregate-data/pages/MSFHomePage";

export type AppVariant =
    | "core-app"
    | "data-metadata-app"
    | "module-package-app"
    | "msf-aggregate-data-app";

const Root: React.FC = () => {
    const appVariant = process.env.REACT_APP_PRESENTATION_VARIANT as AppVariant;
    const { api } = useAppContext();

    return (
        <HashRouter>
            <Switch>
                <RouteWithSession
                    path={"/instances/mapping/:id/:section(aggregated|tracker|orgUnit|global)"}
                    render={() => <InstanceMappingPage />}
                />

                <RouteWithSession
                    path={"/instances/mapping/:id"}
                    render={() => <InstanceMappingLandingPage />}
                />

                <RouteWithSession
                    path={"/instances/:action(new|edit)/:id?"}
                    render={() => <InstanceCreationPage />}
                />

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
                    authorize={props => {
                        const { id } = props.match.params as SyncRulesCreationParams;

                        return permissions.verifyUserHasAccessToSyncRule(api, id);
                    }}
                    render={() => <SyncRulesCreationPage />}
                />

                <RouteWithSession
                    path="/sync-rules/:type(metadata|aggregated|events)"
                    render={() => <SyncRulesPage />}
                />

                <RouteWithSession
                    path="/history/:type(metadata|aggregated|events)/:id?"
                    render={() => <HistoryPage />}
                />

                <RouteWithSession
                    path={"/modules/:action(new|edit)/:id?"}
                    render={() => <ModuleCreationPage />}
                />

                <RouteWithSession
                    path={"/stores/:action(new|edit)/:id?"}
                    render={() => <StoreCreationPage />}
                />

                <RouteWithSession path="/stores" render={() => <StoreListPage />} />

                <RouteWithSession
                    path="/:list(modules|packages)"
                    render={() => <ModulePackageListPage />}
                />

                <RouteWithSession path="/custodians" render={() => <ResponsiblesListPage />} />

                <RouteWithSession
                    path="/notifications/:id?"
                    render={() => <NotificationsListPage />}
                />

                <RouteWithSession
                    path={appVariant === "msf-aggregate-data-app" ? "/dashboard" : "/"}
                    render={() => (
                        <HomePage
                            type={appVariant === "msf-aggregate-data-app" ? "dashboard" : "home"}
                        />
                    )}
                />

                {appVariant === "msf-aggregate-data-app" && (
                    <RouteWithSession path="/" exact render={() => <MSFHomePage />} />
                )}
            </Switch>
        </HashRouter>
    );
};

export default Root;
