import { useConfig } from "@dhis2/app-runtime";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
//@ts-ignore
import { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import i18n from "../../utils/i18n";
import { D2Api } from "../../types/d2-api";
import { CompositionRoot } from "../CompositionRoot";
import { useMigrations } from "../react/core/components/migrations/hooks";
import { AppContext, AppContextState } from "../react/core/contexts/AppContext";
import { muiTheme } from "../react/core/themes/dhis2.theme";
import { d2 } from "../webapp/WebApp";
import Root from "./pages/Root";
import "./WidgetApp.css";
import { getWebappCompositionRoot } from "../NewCompositionRoot";

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

            const newCompositionRoot = getWebappCompositionRoot(instance);

            setAppContext({ d2: d2, api, compositionRoot, newCompositionRoot });
        };

        run();
    }, [baseUrl]);

    if (migrations.state.type === "pending") {
        return <p>{i18n.t("Widget cannot be used until an administrator opens the application")}</p>;
    }

    return (
        <StylesProvider generateClassName={generateClassName}>
            <MuiThemeProvider theme={muiTheme}>
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
            </MuiThemeProvider>
        </StylesProvider>
    );
};

export default App;
