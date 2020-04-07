import { useConfig, useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { init } from "d2";
import { ApiContext, D2ApiDefault } from "d2-api";
import axiosRetry from "axios-retry";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import Share from "../../components/share/Share";
import Instance from "../../models/instance";
import { initializeAppRoles } from "../../utils/permissions";
import "./App.css";
import Root from "./Root";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";
import { MigrationsRunner } from "../../migrations";
import Migrations from "../../components/migrations/Migrations";

const axiosMaxRetries = 3;

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const isLangRTL = code => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

function initFeedbackTool(d2, appConfig) {
    const appKey = _(appConfig).get("appKey");

    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        if (window.$) window.$.feedbackDhis2(d2, appKey, feedbackOptions);
        else console.error("Could not initialize feedback tool");
    }
}

const configI18n = ({ keyUiLocale: uiLocale }) => {
    i18n.changeLanguage(uiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(uiLocale) ? "rtl" : "ltr");
};

const query = {
    userSettings: { resource: "/userSettings" },
};

const App = () => {
    const { baseUrl } = useConfig();
    const [d2, setD2] = useState(null);
    const [api, setApi] = useState(null);
    const [migrationsState, setMigrationsState] = useState({ type: "checking" });
    const [showShareButton, setShowShareButton] = useState(false);
    const { loading, error, data } = useDataQuery(query);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());
            const d2 = await init({ baseUrl: baseUrl + "/api" });
            const api = new D2ApiDefault({ baseUrl });

            Object.assign({ d2, api });

            configI18n(data.userSettings);
            setD2(d2);
            setApi(api);
            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);

            if (appConfig && appConfig.encryptionKey) {
                Instance.setEncryptionKey(appConfig.encryptionKey);
            }

            await initializeAppRoles(d2.Api.getApi().baseUrl);
            runMigrations(baseUrl).then(setMigrationsState);
        };

        if (data) run();
    }, [data, baseUrl]);

    if (error) {
        return (
            <h3>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>
                {` ${baseUrl}`}
            </h3>
        );
    } else if (migrationsState.type === "pending") {
        return (
            <Migrations
                runner={migrationsState.runner}
                onFinish={() => setMigrationsState({ type: "checked" })}
            />
        );
    } else if (loading || !d2 || !api || migrationsState.type === "checking") {
        return <h3>Connecting to {baseUrl}...</h3>;
    } else if (migrationsState.type === "checked") {
        return (
            <StylesProvider generateClassName={generateClassName}>
                <MuiThemeProvider theme={muiTheme}>
                    <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                        <LoadingProvider>
                            <SnackbarProvider>
                                <HeaderBar appName={i18n.t("MetaData Synchronization")} />

                                <div id="app" className="content">
                                    <ApiContext.Provider value={{ d2, api }}>
                                        <Root />
                                    </ApiContext.Provider>
                                </div>

                                <Share visible={showShareButton} />
                            </SnackbarProvider>
                        </LoadingProvider>
                    </OldMuiThemeProvider>
                </MuiThemeProvider>
            </StylesProvider>
        );
    }
};

async function runMigrations(baseUrl) {
    const api = new D2ApiDefault({ baseUrl });
    axiosRetry(api.connection, { retries: axiosMaxRetries });
    const runner = await MigrationsRunner.init({ api, debug: console.debug });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}

export default App;
