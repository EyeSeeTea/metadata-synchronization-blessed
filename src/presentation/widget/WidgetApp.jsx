import { useConfig } from "@dhis2/app-runtime";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { init } from "d2";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import i18n from "../../locales";
import { MigrationsRunner } from "../../migrations";
import { D2Api } from "../../types/d2-api";
import { debug } from "../../utils/debug";
import { AppContext } from "../react/contexts/AppContext";
import muiThemeLegacy from "../react/themes/dhis2-legacy.theme";
import { muiTheme } from "../react/themes/dhis2.theme";
import { CompositionRoot } from "../CompositionRoot";
import Root from "./pages/Root";
import "./WidgetApp.css";

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState(null);
    const [migrationsState, setMigrationsState] = useState({ type: "checking" });

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const encryptionKey = appConfig?.encryptionKey;
            if (!encryptionKey) throw new Error("You need to provide a valid encryption key");

            const d2 = await init({ baseUrl: `${baseUrl}/api` });
            const api = new D2Api({ baseUrl, backend: "fetch" });
            const instance = Instance.build({ name: "This instance", url: baseUrl });

            const compositionRoot = new CompositionRoot(instance, encryptionKey);
            setAppContext({ d2, api, compositionRoot });

            runMigrations(api).then(setMigrationsState);
        };

        run();
    }, [baseUrl]);

    if (migrationsState.type === "pending") {
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
    const runner = await MigrationsRunner.init({ api, debug: debug });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}

export default App;
