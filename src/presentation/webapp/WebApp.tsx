import { useConfig } from "@dhis2/app-runtime";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui";
import { LoadingProvider, SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { init } from "d2";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { initializeAppRoles } from "../../utils/permissions";
import { CompositionRoot } from "../CompositionRoot";
import { useMigrations } from "../react/core/components/migrations/hooks";
import Migrations from "../react/core/components/migrations/Migrations";
import Share from "../react/core/components/share/Share";
import { AppContext, AppContextState } from "../react/core/contexts/AppContext";
import muiThemeLegacy from "../react/core/themes/dhis2-legacy.theme";
import { muiTheme } from "../react/core/themes/dhis2.theme";
import Root from "./Root";
import "./WebApp.css";
import { Feedback } from "@eyeseetea/feedback-component";
import { AppConfig } from "../../app-config.template";
import { Maybe } from "../../types/utils";

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [username, setUsername] = useState("");
    const [showShareButton, setShowShareButton] = useState(false);
    const [appConfig, setAppConfig] = useState<Maybe<AppConfig>>();
    const migrations = useMigrations(appContext);

    const appTitle = process.env.REACT_APP_PRESENTATION_TITLE;

    useEffect(() => {
        const run = async () => {
            const configFromJson = (await fetch("app-config.json", {
                credentials: "same-origin",
            }).then(res => res.json())) as AppConfig;
            const encryptionKey = configFromJson.encryptionKey;
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
            const currentUser = await compositionRoot.user.current();
            if (!currentUser) throw new Error("User not logged in");

            setAppContext({ d2: d2 as object, api, compositionRoot });

            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            setUsername(currentUser.username);
            setAppConfig(configFromJson);
            await initializeAppRoles(baseUrl);
        };

        run();
    }, [appConfig, baseUrl]);

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
                    <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                        <LoadingProvider>
                            <SnackbarProvider>
                                <HeaderBar appName={appTitle} />

                                <div id="app" className="content">
                                    <AppContext.Provider value={appContext}>
                                        <Root />
                                    </AppContext.Provider>
                                </div>

                                <Share visible={showShareButton} />
                                {appConfig && <Feedback options={appConfig.feedback} username={username} />}
                            </SnackbarProvider>
                        </LoadingProvider>
                    </OldMuiThemeProvider>
                </MuiThemeProvider>
            </StylesProvider>
        );
    }

    return null;
};

export default App;
