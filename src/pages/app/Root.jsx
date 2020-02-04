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
import Authorization from "../../components/authorization/Authorization";
import * as permissions from "../../utils/permissions";
import InstanceMappingPage from "../instance-mapping/InstanceMapping";

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
                        render={props => <InstanceMappingPage {...this.props} {...props} />}
                    />

                    <Route
                        path={"/instances/:action(new|edit)/:id?"}
                        render={props => <InstanceCreationPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/instances"
                        render={props => <InstanceListPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/sync/:type(metadata|aggregated|events)"
                        render={props => <SyncOnDemandPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/sync/deleted"
                        render={props => (
                            <Authorization
                                authorize={() =>
                                    permissions.shouldShowDeletedObjects(this.props.d2)
                                }
                            >
                                <DeletedObjectsPage {...this.props} {...props} />
                            </Authorization>
                        )}
                    />

                    <Route
                        path={
                            "/sync-rules/:type(metadata|aggregated|events)/:action(new|edit)/:id?"
                        }
                        render={props => (
                            <Authorization
                                authorize={() =>
                                    permissions.verifyUserHasAccessToSyncRule(
                                        this.props.d2,
                                        props.match.params.id
                                    )
                                }
                            >
                                <SyncRulesCreationPage {...this.props} {...props} />
                            </Authorization>
                        )}
                    />

                    <Route
                        path="/sync-rules/:type(metadata|aggregated|events)"
                        render={props => <SyncRulesPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/history/:type(metadata|aggregated|events)/:id?"
                        render={props => <HistoryPage {...this.props} {...props} />}
                    />

                    <Route render={() => <LandingPage {...this.props} />} />
                </Switch>
            </HashRouter>
        );
    }
}

export default Root;
