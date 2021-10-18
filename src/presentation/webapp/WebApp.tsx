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

const generateClassName = createGenerateClassName({
    productionPrefix: "c",
});

interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback: {
        token: string[];
        createIssue: boolean;
        sendToDhis2UserGroups: string[];
        issues: {
            repository: string;
            title: string;
            body: string;
        };
        snapshots: {
            repository: string;
            branch: string;
        };
        feedbackOptions: {};
    };
}

interface AppWindow extends Window {
    $: {
        feedbackDhis2: (d2: unknown, appKey: string, appConfig: AppConfig["feedback"]["feedbackOptions"]) => void;
    };
}

function initFeedbackTool(d2: unknown, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");
    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        (window as unknown as AppWindow).$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContextState | null>(null);
    const [showShareButton, setShowShareButton] = useState(false);
    const migrations = useMigrations(appContext);

    const appTitle = process.env.REACT_APP_PRESENTATION_TITLE;

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

            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);

            await initializeAppRoles(baseUrl);
        };

        run();
    }, [baseUrl]);

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
