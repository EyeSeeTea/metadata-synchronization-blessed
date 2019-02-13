import React from "react";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import LandingPage from "./LandingPage";

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    render() {
        const { d2 } = this.props;

        return (
            <Switch>
                <Route render={() => <LandingPage d2={d2} />} />
            </Switch>
        );
    }
}

export default Root;
