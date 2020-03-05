import { useD2Api } from "d2-api";
import React from "react";
import { HashRouter, Switch } from "react-router-dom";
import RouteWithSession from "../../components/auth/RouteWithSession";
import RouteWithSessionAndAuth from "../../components/auth/RouteWithSessionAndAuth";
import * as permissions from "../../utils/permissions";
import HistoryPage from "../history/HistoryPage";
import HomePage from "../home/HomePage";
import InstanceCreationPage from "../instance-creation/InstanceCreationPage";
import InstanceListPage from "../instance-list/InstanceListPage";
import InstanceMappingLandingPage from "../instance-mapping/InstanceMappingLandingPage";
import InstanceMappingPage from "../instance-mapping/InstanceMappingPage";
import SyncOnDemandPage from "../sync-on-demand/SyncOnDemandPage";
import SyncRulesCreationPage from "../sync-rules-creation/SyncRulesCreationPage";
import SyncRulesPage from "../sync-rules-list/SyncRulesListPage";

function Root() {
    const api = useD2Api();

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
                    render={props => <SyncOnDemandPage {...props} />}
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

                <RouteWithSession render={() => <HomePage />} />
            </Switch>
        </HashRouter>
    );
}

export default Root;
