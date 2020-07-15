import { useConfig, useDataQuery } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import axiosRetry from "axios-retry";
import { init } from "d2";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { Instance as InstanceEntity } from "../../domain/instance/entities/Instance";
import { MigrationsRunner } from "../../migrations";
import Instance from "../../models/instance";
import { D2Api } from "../../types/d2-api";
import { AppContext } from "../common/contexts/AppContext";
import muiThemeLegacy from "../common/themes/dhis2-legacy.theme";
import { muiTheme } from "../common/themes/dhis2.theme";
import { CompositionRoot } from "../CompositionRoot";
import Root from "./pages/Root";
import "./WidgetApp.css";

const axiosMaxRetries = 3;

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const isLangRTL = code => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

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
    const { error, data } = useDataQuery(query);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const encryptionKey = appConfig?.encryptionKey;
            if (!encryptionKey) throw new Error("You need to provide a valid encryption key");
            Instance.setEncryptionKey(encryptionKey);

            const d2 = await init({ baseUrl: `${baseUrl}/api` });
            const api = new D2Api({ baseUrl });
            const instance = InstanceEntity.build({ name: "This instance", url: baseUrl });

            const compositionRoot = new CompositionRoot(instance, d2, encryptionKey);
            setAppContext({ d2, api, compositionRoot });

            configI18n(data.userSettings);
            runMigrations(api).then(setMigrationsState);
        };

        if (data) run();
    }, [data, baseUrl]);

    if (error) {
        return <p>{i18n.t("Unknown DHIS2 error")}</p>;
    } else if (migrationsState.type === "pending") {
        return (
            <p>{i18n.t("Widget cannot be used until an administrator opens the application")}</p>
        );
    }

    return (
        <StylesProvider generateClassName={generateClassName}>
            <MuiThemeProvider theme={muiTheme}>
                <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                    <LoadingProvider>
                        <SnackbarProvider>
                            {!!appContext && (
                                <div id="app" className="content">
                                    <AppContext.Provider value={appContext}>
                                        <Root />
                                    </AppContext.Provider>
                                </div>
                            )}
                        </SnackbarProvider>
                    </LoadingProvider>
                </OldMuiThemeProvider>
            </MuiThemeProvider>
        </StylesProvider>
    );
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
