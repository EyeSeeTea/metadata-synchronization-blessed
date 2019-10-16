import React from "react";
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import LandingPage from "../landing-page/LandingPage";
import InstanceConfigurator from "../instance-list-page/InstancesPage";
import InstanceFormBuilder from "../instance-creation-page/InstanceCreationPage";
import MetadataPage from "../synchronization-page/MetadataPage";
import DeletedObjectsPage from "../synchronization-page/DeletedObjectsPage";
import HistoryPage from "../history-list-page/HistoryPage";
import SyncRulesWizard from "../rules-creation-page/SyncRulesWizard";
import SyncRulesConfigurator from "../rules-list-page/SyncRulesPage";

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
                    path="/sync/deleted"
                    render={props => <DeletedObjectsPage {...this.props} {...props} />}
                />

                <Route
                    path="/history/:id?"
                    render={props => <HistoryPage {...this.props} {...props} />}
                />

                <Route
                    path={"/synchronization-rules/:action(new|edit)/:id?"}
                    render={props => <SyncRulesWizard {...this.props} {...props} />}
                />

                <Route
                    path="/synchronization-rules"
                    render={props => <SyncRulesConfigurator {...this.props} {...props} />}
                />

                <Route render={() => <LandingPage {...this.props} />} />
            </Switch>
        );
    }
}

export default Root;
