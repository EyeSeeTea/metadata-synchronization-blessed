import React from "react";
import { HashRouter, Switch } from "react-router-dom";
import * as permissions from "../../../utils/permissions";
import RouteWithSession from "../../react/components/auth/RouteWithSession";
import RouteWithSessionAndAuth from "../../react/components/auth/RouteWithSessionAndAuth";
import { useAppContext } from "../../react/contexts/AppContext";
import HistoryPage from "./history/HistoryPage";
import HomePage from "./home/HomePage";
import InstanceCreationPage from "./instance-creation/InstanceCreationPage";
import InstanceListPage from "./instance-list/InstanceListPage";
import InstanceMappingLandingPage from "./instance-mapping/InstanceMappingLandingPage";
import InstanceMappingPage from "./instance-mapping/InstanceMappingPage";
import ManualSyncPage from "./manual-sync/ManualSyncPage";
import ModulePackageListPage from "./module-package-list/ModulePackageListPage";
import ModuleCreationPage from "./modules-creation/ModuleCreationPage";
import NotificationsListPage from "./notifications-list/NotificationsListPage";
import ResponsiblesListPage from "./responsibles-list/ResponsiblesListPage";
import StoreCreationPage from "./store-creation/StoreCreationPage";
import StoreListPage from "./store-list/StoreListPage";
import SyncRulesCreationPage from "./sync-rules-creation/SyncRulesCreationPage";
import SyncRulesPage from "./sync-rules-list/SyncRulesListPage";

function Root() {
    const { api } = useAppContext();

    return (
        <HashRouter>
            <Switch>
                <RouteWithSession
                    path={"/instances/mapping/:id/:section(aggregated|tracker|orgUnit|global)"}
                    render={props => <InstanceMappingPage {...props} />}
                />

                <RouteWithSession
                    path={"/instances/mapping/:id"}
                    render={props => <InstanceMappingLandingPage {...props} />}
                />

                <RouteWithSession
                    path={"/instances/:action(new|edit)/:id?"}
                    render={props => <InstanceCreationPage {...props} />}
                />

                <RouteWithSession
                    path="/instances"
                    render={props => <InstanceListPage {...props} />}
                />

                <RouteWithSession
                    path="/sync/:type(metadata|aggregated|events|deleted)"
                    authorize={props =>
                        props.match.params.type !== "deleted" ||
                        permissions.shouldShowDeletedObjects(api)
                    }
                    render={props => <ManualSyncPage {...props} />}
                />

                <RouteWithSessionAndAuth
                    path={"/sync-rules/:type(metadata|aggregated|events)/:action(new|edit)/:id?"}
                    authorize={props =>
                        permissions.verifyUserHasAccessToSyncRule(api, props.match.params.id)
                    }
                    render={props => <SyncRulesCreationPage {...props} />}
                />

                <RouteWithSession
                    path="/sync-rules/:type(metadata|aggregated|events)"
                    render={props => <SyncRulesPage {...props} />}
                />

                <RouteWithSession
                    path="/history/:type(metadata|aggregated|events)/:id?"
                    render={props => <HistoryPage {...props} />}
                />

                <RouteWithSession
                    path={"/modules/:action(new|edit)/:id?"}
                    render={props => <ModuleCreationPage {...props} />}
                />

                <RouteWithSession
                    path={"/stores/:action(new|edit)/:id?"}
                    render={props => <StoreCreationPage {...props} />}
                />

                <RouteWithSession path="/stores" render={props => <StoreListPage {...props} />} />

                <RouteWithSession
                    path="/:list(modules|packages)"
                    render={props => <ModulePackageListPage {...props} />}
                />

                <RouteWithSession
                    path="/custodians"
                    render={props => <ResponsiblesListPage {...props} />}
                />

                <RouteWithSession
                    path="/notifications/:id?"
                    render={props => <NotificationsListPage {...props} />}
                />

                <RouteWithSession render={() => <HomePage />} />
            </Switch>
        </HashRouter>
    );
}

export default Root;
