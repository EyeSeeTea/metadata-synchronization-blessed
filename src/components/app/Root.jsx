import React from "react";
import PropTypes from "prop-types";
import { Route, Switch } from "react-router-dom";

import LandingPage from "../landing-page/LandingPage";
import InstanceConfigurator from "../instance-list-page/InstancesPage";
import InstanceFormBuilder from "../instance-creation-page/InstanceCreationPage";
import OrganisationUnitPage from "../synchronization-page/OrganisationUnitPage";
import DataElementPage from "../synchronization-page/DataElementPage";
import IndicatorPage from "../synchronization-page/IndicatorPage";
import ValidationRulePage from "../synchronization-page/ValidationRulePage";
import DeletedObjectsPage from "../synchronization-page/DeletedObjectsPage";
import HistoryPage from "../history-list-page/HistoryPage";
import SyncRulesWizard from "../rules-creation-page/SyncRulesWizard";
import SyncRulesConfigurator from "../rules-list-page/SyncRulesPage";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <Switch>
                <Route
                    path={"/instance-configurator/:action(new|edit)/:id?"}
                    render={props => <InstanceFormBuilder d2={d2} {...props} />}
                />

                <Route
                    path="/instance-configurator"
                    render={props => <InstanceConfigurator d2={d2} {...props} />}
                />

                <Route
                    path="/sync/organisationUnits"
                    render={props => <OrganisationUnitPage d2={d2} {...props} />}
                />

                <Route
                    path="/sync/dataElements"
                    render={props => <DataElementPage d2={d2} {...props} />}
                />

                <Route
                    path="/sync/indicators"
                    render={props => <IndicatorPage d2={d2} {...props} />}
                />

                <Route
                    path="/sync/validationRules"
                    render={props => <ValidationRulePage d2={d2} {...props} />}
                />

                <Route
                    path="/sync/deleted"
                    render={props => <DeletedObjectsPage d2={d2} {...props} />}
                />

                <Route path="/history/:id?" render={props => <HistoryPage d2={d2} {...props} />} />

                <Route
                    path={"/synchronization-rules/:action(new|edit)/:id?"}
                    render={props => <SyncRulesWizard d2={d2} {...props} />}
                />

                <Route
                    path="/synchronization-rules"
                    render={props => <SyncRulesConfigurator d2={d2} {...props} />}
                />

                <Route render={() => <LandingPage d2={d2} />} />
            </Switch>
        );
    }
}

export default Root;
