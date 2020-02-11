import PropTypes from "prop-types";
import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import HistoryPage from "../history/HistoryPage";
import InstanceCreationPage from "../instance-creation/InstanceCreationPage";
import InstanceListPage from "../instance-list/InstanceListPage";
import LandingPage from "../landing/LandingPage";
import DeletedObjectsPage from "../sync-deleted-objects/DeletedObjectsPage";
import SyncOnDemandPage from "../sync-on-demand/SyncOnDemandPage";
import SyncRulesCreationPage from "../sync-rules-creation/SyncRulesCreationPage";
import SyncRulesPage from "../sync-rules-list/SyncRulesListPage";
import * as permissions from "../../utils/permissions";
import InstanceMappingPage from "../instance-mapping/InstanceMapping";
import WithSession from "../../components/auth/WithSession";
import WithSessionAndAuth from "../../components/auth/WithSessionAndAuth";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route
                        path={"/instances/mapping/:id?"}
                        render={props => (
                            <WithSession>
                                <InstanceMappingPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        path={"/instances/:action(new|edit)/:id?"}
                        render={props => (
                            <WithSession>
                                <InstanceCreationPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        path="/instances"
                        render={props => (
                            <WithSession>
                                <InstanceListPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        path="/sync/:type(metadata|aggregated|events)"
                        render={props => (
                            <WithSession>
                                <SyncOnDemandPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        path="/sync/deleted"
                        render={props => (
                            <WithSessionAndAuth
                                authorize={() =>
                                    permissions.shouldShowDeletedObjects(this.props.d2)
                                }
                            >
                                <DeletedObjectsPage {...this.props} {...props} />
                            </WithSessionAndAuth>
                        )}
                    />

                    <Route
                        path={
                            "/sync-rules/:type(metadata|aggregated|events)/:action(new|edit)/:id?"
                        }
                        render={props => (
                            <WithSessionAndAuth
                                authorize={() =>
                                    permissions.verifyUserHasAccessToSyncRule(
                                        this.props.d2,
                                        props.match.params.id
                                    )
                                }
                            >
                                <SyncRulesCreationPage {...this.props} {...props} />
                            </WithSessionAndAuth>
                        )}
                    />

                    <Route
                        path="/sync-rules/:type(metadata|aggregated|events)"
                        render={props => (
                            <WithSession>
                                <SyncRulesPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        path="/history/:type(metadata|aggregated|events)/:id?"
                        render={props => (
                            <WithSession>
                                <HistoryPage {...this.props} {...props} />
                            </WithSession>
                        )}
                    />

                    <Route
                        render={() => (
                            <WithSession>
                                <LandingPage {...this.props} />
                            </WithSession>
                        )}
                    />
                </Switch>
            </HashRouter>
        );
    }
}

export default Root;
