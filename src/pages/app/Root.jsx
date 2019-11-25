import PropTypes from "prop-types";
import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import DataSyncRulesWizard from "../../components/sync-wizard/data/DataSyncRulesWizard";
import MetadadaSyncRulesWizard from "../../components/sync-wizard/metadata/MetadataSyncRulesWizard";
import HistoryPage from "../history/HistoryPage";
import InstanceCreationPage from "../instance-creation/InstanceCreationPage";
import InstanceListPage from "../instance-list/InstanceListPage";
import LandingPage from "../landing/LandingPage";
import DeletedObjectsPage from "../sync-deleted-objects/DeletedObjectsPage";
import DataSyncPage from "../sync-on-demand/DataPage";
import MetadataSyncPage from "../sync-on-demand/MetadataPage";
import SyncRulesPage from "../sync-rules-list/SyncRulesPage";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        return (
            <HashRouter>
                <Switch>
                    <Route
                        path={"/instance-configurator/:action(new|edit)/:id?"}
                        render={props => <InstanceCreationPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/instance-configurator"
                        render={props => <InstanceListPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/sync/metadata"
                        render={props => <MetadataSyncPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/sync/data"
                        render={props => <DataSyncPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/sync/deleted"
                        render={props => <DeletedObjectsPage {...this.props} {...props} />}
                    />

                    <Route
                        path="/history/:id?"
                        render={props => <HistoryPage {...this.props} {...props} />}
                    />

                    <Route
                        path={"/metadata-synchronization-rules/:action(new|edit)/:id?"}
                        render={props => <MetadadaSyncRulesWizard {...this.props} {...props} />}
                    />

                    <Route
                        path={"/data-synchronization-rules/:action(new|edit)/:id?"}
                        render={props => <DataSyncRulesWizard {...this.props} {...props} />}
                    />

                    <Route
                        path="/metadata-synchronization-rules"
                        render={props => (
                            <SyncRulesPage type="metadata" {...this.props} {...props} />
                        )}
                    />

                    <Route
                        path="/data-synchronization-rules"
                        render={props => <SyncRulesPage type="data" {...this.props} {...props} />}
                    />

                    <Route render={() => <LandingPage {...this.props} />} />
                </Switch>
            </HashRouter>
        );
    }
}

export default Root;
