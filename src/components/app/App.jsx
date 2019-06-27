import React, { Component } from "react";
import PropTypes from "prop-types";
import HeaderBar from "@dhis2/d2-ui-header-bar";
import { createGenerateClassName, MuiThemeProvider } from "@material-ui/core/styles";
import JssProvider from "react-jss/lib/JssProvider";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";

import Root from "./Root";
import Share from "../share/Share";
import Instance from "../../models/instance";
import { muiTheme } from "./themes/dhis2.theme";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import "./App.css";

const generateClassName = createGenerateClassName({
    dangerouslyUseGlobalCSS: false,
    productionPrefix: "c",
});

class App extends Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        appConfig: PropTypes.object.isRequired,
    };

    componentDidMount() {
        const { d2, appConfig } = this.props;
        const appKey = _(this.props.appConfig).get("appKey");

        if (appConfig && appConfig.feedback) {
            const feedbackOptions = {
                ...appConfig.feedback,
                i18nPath: "feedback-tool/i18n",
            };
            window.$.feedbackDhis2(d2, appKey, feedbackOptions);
        }

        if (appConfig && appConfig.encryptionKey) {
            Instance.setEncryptionKey(appConfig.encryptionKey);
        }
    }

    render() {
        const { d2, appConfig } = this.props;
        const showShareButton = _(appConfig).get("appearance.showShareButton") || false;
        const showHeader = !process.env.REACT_APP_CYPRESS;

        return (
            <React.Fragment>
                <JssProvider generateClassName={generateClassName}>
                    <MuiThemeProvider theme={muiTheme}>
                        <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                            <LoadingProvider>
                                <React.Fragment>
                                    {showHeader && <HeaderBar d2={d2} />}

                                    <div id="app" className="content">
                                        <SnackbarProvider>
                                            <Root d2={d2} />
                                        </SnackbarProvider>
                                    </div>

                                    <Share visible={showShareButton} />
                                </React.Fragment>
                            </LoadingProvider>
                        </OldMuiThemeProvider>
                    </MuiThemeProvider>
                </JssProvider>
            </React.Fragment>
        );
    }
}

export default App;
