import { useConfig } from "@dhis2/app-runtime";
//@ts-ignore
import { HeaderBar } from "@dhis2/ui-widgets";
import { MuiThemeProvider } from "@material-ui/core/styles";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { init } from "d2";
import { LoadingProvider, SnackbarProvider } from "d2-ui-components";
import _ from "lodash";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { Instance } from "../../domain/instance/entities/Instance";
import { MigrationsRunner } from "../../migrations";
import { D2Api } from "../../types/d2-api";
import { debug } from "../../utils/debug";
import { initializeAppRoles } from "../../utils/permissions";
import { AppContext } from "../react/contexts/AppContext";
import muiThemeLegacy from "../react/themes/dhis2-legacy.theme";
import { muiTheme } from "../react/themes/dhis2.theme";
import { CompositionRoot } from "../CompositionRoot";
import Migrations from "../react/components/migrations/Migrations";
import Share from "../react/components/share/Share";
import Root from "./pages/Root";
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
        feedbackDhis2: (
            d2: unknown,
            appKey: string,
            appConfig: AppConfig["feedback"]["feedbackOptions"]
        ) => void;
    };
}

function initFeedbackTool(d2: unknown, appConfig: AppConfig): void {
    const appKey = _(appConfig).get("appKey");
    if (appConfig && appConfig.feedback) {
        const feedbackOptions = {
            ...appConfig.feedback,
            i18nPath: "feedback-tool/i18n",
        };
        ((window as unknown) as AppWindow).$.feedbackDhis2(d2, appKey, feedbackOptions);
    }
}

type MigrationState =
    | {
          type: "checking" | "checked";
      }
    | {
          type: "pending";
          runner: MigrationsRunner;
      };

const App = () => {
    const { baseUrl } = useConfig();
    const [appContext, setAppContext] = useState<AppContext | null>(null);
    const [migrationsState, setMigrationsState] = useState<MigrationState>({ type: "checking" });
    const [showShareButton, setShowShareButton] = useState(false);

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
            const instance = Instance.build({ name: "This instance", url: baseUrl, version });

            const compositionRoot = new CompositionRoot(instance, encryptionKey);

            setAppContext({ d2: d2 as object, api, compositionRoot });

            Object.assign(window, { d2, api });
            setShowShareButton(_(appConfig).get("appearance.showShareButton") || false);
            initFeedbackTool(d2, appConfig);

            await initializeAppRoles(baseUrl);
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
    } else return null;
};

async function runMigrations(api: D2Api): Promise<MigrationState> {
    const runner = await MigrationsRunner.init({ api, debug: debug });

    if (runner.hasPendingMigrations()) {
        return { type: "pending", runner };
    } else {
        return { type: "checked" };
    }
}

export default App;
