import PropTypes from "prop-types";
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
import DeletedObjectsPage from "../sync-deleted-objects/DeletedObjectsPage";
import SyncOnDemandPage from "../sync-on-demand/SyncOnDemandPage";
import SyncRulesCreationPage from "../sync-rules-creation/SyncRulesCreationPage";
import SyncRulesPage from "../sync-rules-list/SyncRulesListPage";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        return (
            <HashRouter>
                <Switch>
                    <RouteWithSession
                        path={"/instances/mapping/:section(aggregated|tracker|orgUnit)/:id?"}
                        render={props => <InstanceMappingPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path={"/instances/mapping/:id?"}
                        render={props => <InstanceMappingLandingPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path={"/instances/:action(new|edit)/:id?"}
                        render={props => <InstanceCreationPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path="/instances"
                        render={props => <InstanceListPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path="/sync/:type(metadata|aggregated|events)"
                        render={props => <SyncOnDemandPage {...this.props} {...props} />}
                    />

                    <RouteWithSessionAndAuth
                        path="/sync/deleted"
                        authorize={props => permissions.shouldShowDeletedObjects(this.props.d2)}
                        render={props => <DeletedObjectsPage {...this.props} {...props} />}
                    />

                    <RouteWithSessionAndAuth
                        path={
                            "/sync-rules/:type(metadata|aggregated|events)/:action(new|edit)/:id?"
                        }
                        authorize={props =>
                            permissions.verifyUserHasAccessToSyncRule(
                                this.props.d2,
                                props.match.params.id
                            )
                        }
                        render={props => <SyncRulesCreationPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path="/sync-rules/:type(metadata|aggregated|events)"
                        render={props => <SyncRulesPage {...this.props} {...props} />}
                    />

                    <RouteWithSession
                        path="/history/:type(metadata|aggregated|events)/:id?"
                        render={props => <HistoryPage {...this.props} {...props} />}
                    />

                    <RouteWithSession render={() => <HomePage {...this.props} />} />
                </Switch>
            </HashRouter>
        );
    }
}

export default Root;
