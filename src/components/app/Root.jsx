import React from "react";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import InstanceConfigurator from "../instance-configurator/InstanceConfigurator";
import InstanceWizard from "../instance-wizard/InstanceWizard";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <Switch>
                <Route
                    path="/instance-configurator"
                    render={props => <InstanceConfigurator d2={d2} {...props} />}
                />

                <Route
                    path="/instance-configurator/new"
                    render={props => <InstanceWizard d2={d2} {...props} />}
                />

                <Route render={() => <LandingPage d2={d2} />} />
            </Switch>
        );
    }
}

export default Root;
