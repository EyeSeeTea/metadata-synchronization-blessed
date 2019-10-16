import React from "react";
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import LandingPage from "../landing-page/LandingPage";
import InstanceConfigurator from "../instance-list-page/InstancesPage";
import InstanceFormBuilder from "../instance-creation-page/InstanceCreationPage";
import MetadataPage from "../synchronization-page/MetadataPage";
import DataPage from "../synchronization-page/DataPage";
import DeletedObjectsPage from "../synchronization-page/DeletedObjectsPage";
import HistoryPage from "../history-list-page/HistoryPage";
import MetadadaSyncRulesWizard from "../rules-creation-page/metadata/MetadataSyncRulesWizard";
import MetadataSyncRulesPage from "../rules-list-page/MetadataSyncRulesPage";
import DataSyncRulesPage from "../rules-list-page/DataSyncRulesPage";
import DataSyncRulesWizard from "../rules-creation-page/data/DataSyncRulesWizard";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        return (
            <Switch>
                <Route
                    path={"/instance-configurator/:action(new|edit)/:id?"}
                    render={props => <InstanceFormBuilder {...this.props} {...props} />}
                />

                <Route
                    path="/instance-configurator"
                    render={props => <InstanceConfigurator {...this.props} {...props} />}
                />

                <Route
                    path="/sync/metadata"
                    render={props => <MetadataPage {...this.props} {...props} />}
                />

                <Route
                    path="/sync/data"
                    render={props => <DataPage {...this.props} {...props} />}
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
                    render={props => <MetadataSyncRulesPage {...this.props} {...props} />}
                />

                <Route
                    path="/data-synchronization-rules"
                    render={props => <DataSyncRulesPage {...this.props} {...props} />}
                />

                <Route render={() => <LandingPage {...this.props} />} />
            </Switch>
        );
    }
}

export default Root;
