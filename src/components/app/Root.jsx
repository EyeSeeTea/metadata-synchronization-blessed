import React from "react";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import InstanceConfigurator from "../instance-configurator/InstanceConfigurator";
import InstanceFormBuilder from "../instance-form-builder/InstanceFormBuilder";
import OrganisationUnitSync from "../sync-configurator/OrganisationUnitSync";
import DataElementSync from "../sync-configurator/DataElementSync";
import IndicatorSync from "../sync-configurator/IndicatorSync";
import ValidationRuleSync from "../sync-configurator/ValidationRuleSync";

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
                    render={props => <OrganisationUnitSync d2={d2} {...props} />}
                />

                <Route
                    path="/sync/dataElements"
                    render={props => <DataElementSync d2={d2} {...props} />}
                />

                <Route
                    path="/sync/indicators"
                    render={props => <IndicatorSync d2={d2} {...props} />}
                />

                <Route
                    path="/sync/validationRules"
                    render={props => <ValidationRuleSync d2={d2} {...props} />}
                />

                <Route render={() => <LandingPage d2={d2} />} />
            </Switch>
        );
    }
}

export default Root;
