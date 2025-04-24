import { useConfig } from "@dhis2/app-runtime";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
//@ts-ignore
import { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { CompositionRoot } from "../CompositionRoot";
import { useMigrations } from "../react/core/components/migrations/hooks";
import Migrations from "../react/core/components/migrations/Migrations";
import Share from "../react/core/components/share/Share";
import { AppContext, AppContextState } from "../react/core/contexts/AppContext";
import { useDeleteHistory } from "../react/core/components/deleting-history/useDeleteHistory";
import { muiTheme } from "../react/core/themes/dhis2.theme";
import Root from "./Root";
import "./WebApp.css";
import { DeletingHistory } from "../react/core/components/deleting-history/DeletingHistory";
import { Feedback } from "@eyeseetea/feedback-component";
import { AppConfig } from "../../app-config.template";
import { Maybe } from "../../types/utils";
import { getWebappCompositionRoot } from "../NewCompositionRoot";

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [username, setUsername] = useState("");
    const [appConfig, setAppConfig] = useState<Maybe<AppConfig>>();
    const migrations = useMigrations(appContext);
    const { deletingHistory } = useDeleteHistory(appContext);

    const appTitle = process.env.REACT_APP_PRESENTATION_TITLE;

    useEffect(() => {
        const run = async () => {
            const configFromJson = (await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json())) as AppConfig;
            const encryptionKey = configFromJson.encryptionKey;
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
            const currentUser = await compositionRoot.user.current();
            if (!currentUser) throw new Error("User not logged in");

            const newCompositionRoot = getWebappCompositionRoot(instance);
            setAppContext({ d2: d2, api, compositionRoot, newCompositionRoot });

            Object.assign(window, { api });
            setUsername(currentUser.username);
            setAppConfig(configFromJson);
            await compositionRoot.roles.validate();
        };

        run();
    }, [baseUrl]);

    if (deletingHistory) {
        return (
            <LoadingProvider>
                <AppContext.Provider value={appContext}>
                    <DeletingHistory deleting={true} />
                </AppContext.Provider>
            </LoadingProvider>
        );
    }
    const showShareButton = appConfig?.appearance.showShareButton || false;

    if (migrations.state.type === "pending") {
        return (
            <AppContext.Provider value={appContext}>
                <Migrations migrations={migrations} />
            </AppContext.Provider>
        );
    }

    if (migrations.state.type === "checked") {
        return (
            <StylesProvider generateClassName={generateClassName}>
                <MuiThemeProvider theme={muiTheme}>
                    <LoadingProvider>
                        <SnackbarProvider>
                            <HeaderBar appName={appTitle} />

                            <div id="app" className="content">
                                <AppContext.Provider value={appContext}>
                                    <Root />
                                </AppContext.Provider>
                            </div>

                            <Share visible={showShareButton} />
                            {appConfig?.feedback && <Feedback options={appConfig.feedback} username={username} />}
                        </SnackbarProvider>
                    </LoadingProvider>
                </MuiThemeProvider>
            </StylesProvider>
        );
    }

    return null;
};

// Use empty object as d2 for now (so we can remove the "d2" dependency). In this app is only
// used as prop for d2-ui-components:MultiSelect (internally used for translations).
export const d2 = {};

export default App;
