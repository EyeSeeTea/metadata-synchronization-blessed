import { useConfig, useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import axiosRetry from "axios-retry";
import { init } from "d2";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import Migrations from "../../components/migrations/Migrations";
import Share from "../../components/share/Share";
import { CompositionRoot } from "../../CompositionRoot";
import { AppContext } from "../../contexts/AppContext";
import { MigrationsRunner } from "../../migrations";
import Instance from "../../models/instance";
import { D2Api } from "../../types/d2-api";
import { initializeAppRoles } from "../../utils/permissions";
import "./App.css";
import Root from "./Root";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

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
    const [appContext, setAppContext] = useState(null);
    const [migrationsState, setMigrationsState] = useState({ type: "checking" });
    const [showShareButton, setShowShareButton] = useState(false);
    const { loading, error, data } = useDataQuery(query);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const encryptionKey = appConfig?.encryptionKey;
            if (!encryptionKey) throw new Error("You need to provide a valid encryption key");
            Instance.setEncryptionKey(encryptionKey);

            const d2 = await init({ baseUrl: baseUrl + "/api" });
            const api = new D2Api({ baseUrl });

            const compositionRoot = new CompositionRoot(api, d2, encryptionKey);

            const appContext = { d2, api, compositionRoot };
            setAppContext(appContext);

            Object.assign({ d2, api });

            configI18n(data.userSettings);
            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);

            await initializeAppRoles(d2.Api.getApi().baseUrl);
            runMigrations(api).then(setMigrationsState);
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
    } else if (
        loading ||
        !appContext?.d2 ||
        !appContext?.api ||
        migrationsState.type === "checking"
    ) {
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
                                    <AppContext.Provider value={appContext}>
                                        <Root />
                                    </AppContext.Provider>
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

async function runMigrations(api) {
    axiosRetry(api.connection, { retries: axiosMaxRetries });
    const runner = await MigrationsRunner.init({ api, debug: console.debug });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}

export default App;
