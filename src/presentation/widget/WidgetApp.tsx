import { useConfig } from "@dhis2/app-runtime";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { init } from "d2";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import i18n from "../../locales";
import { D2Api } from "../../types/d2-api";
import { CompositionRoot } from "../CompositionRoot";
import { useMigrations } from "../react/core/components/migrations/hooks";
import { AppContext, AppContextState } from "../react/core/contexts/AppContext";
import muiThemeLegacy from "../react/core/themes/dhis2-legacy.theme";
import { muiTheme } from "../react/core/themes/dhis2.theme";
import Root from "./pages/Root";
import "./WidgetApp.css";

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const migrations = useMigrations(appContext);

    useEffect(() => {
        const run = async () => {
            const appConfig = await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json());

            const encryptionKey = appConfig?.encryptionKey;
            if (!encryptionKey) throw new Error("You need to provide a valid encryption key");

            const d2 = await init({ baseUrl: `${baseUrl}/api` });
            const api = new D2Api({ baseUrl, backend: "fetch" });
            const version = await api.getVersion();
            const instance = Instance.build({
                type: "local",
                name: "This instance",
                url: baseUrl,
                version,
            });

            const compositionRoot = new CompositionRoot(instance, encryptionKey);
            await compositionRoot.app.initialize();

            setAppContext({ d2: d2 as object, api, compositionRoot });
        };

        run();
    }, [baseUrl]);

    if (migrations.state.type === "pending") {
        return <p>{i18n.t("Widget cannot be used until an administrator opens the application")}</p>;
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

export default App;
