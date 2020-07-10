import { useConfig } from "@dhis2/app-runtime";
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import axiosRetry from "axios-retry";
import { init } from "d2";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import i18n from "../../locales";
import { MigrationsRunner } from "../../migrations";
import { D2Api } from "../../types/d2-api";
import { initializeAppRoles } from "../../utils/permissions";
import { AppContext } from "../common/contexts/AppContext";
import muiThemeLegacy from "../common/themes/dhis2-legacy.theme";
import { muiTheme } from "../common/themes/dhis2.theme";
import { CompositionRoot } from "../CompositionRoot";
import Migrations from "./components/migrations/Migrations";
import Share from "./components/share/Share";
import Root from "./pages/Root";
import "./WebApp.css";

const axiosMaxRetries = 3;

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

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

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState(null);
    const [migrationsState, setMigrationsState] = useState({ type: "checking" });
    const [showShareButton, setShowShareButton] = useState(false);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const encryptionKey = appConfig?.encryptionKey;
            if (!encryptionKey) throw new Error("You need to provide a valid encryption key");

            const d2 = await init({ baseUrl: `${baseUrl}/api` });
            const api = new D2Api({ baseUrl });
            const instance = Instance.build({ name: "This instance", url: baseUrl });

            const compositionRoot = new CompositionRoot(instance, d2, encryptionKey);

            const appContext = { d2, api, compositionRoot };
            setAppContext(appContext);

            Object.assign({ d2, api });

            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);

            await initializeAppRoles(d2.Api.getApi().baseUrl);
            runMigrations(api).then(setMigrationsState);
        };

        run();
    }, [baseUrl]);

    if (migrationsState.type === "pending") {
        return (
            <Migrations
                runner={migrationsState.runner}
                onFinish={() => setMigrationsState({ type: "checked" })}
            />
        );
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
    } else return null;
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
