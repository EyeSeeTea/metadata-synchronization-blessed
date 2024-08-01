import { Provider } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import axios from "axios";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { D2Api } from "./types/d2-api";
import { PresentationLoader } from "./presentation/PresentationLoader";
import "./presentation/utils/wdyr";
import { getD2APiFromInstance } from "./utils/d2-utils";
import { Instance } from "./domain/instance/entities/Instance";

declare global {
    interface Window {
        api: D2Api;
        d2: unknown;
    }
}

const isDev = process.env.NODE_ENV === "development";

async function getBaseUrl() {
    if (isDev) {
        return "/dhis2"; // See src/setupProxy.js
    } else {
        const { data: manifest } = await axios.get<AppManifest>("manifest.webapp");
        return getUrlForCurrentDomain(manifest.activities.dhis.href);
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

function getUrlForCurrentDomain(path: string) {
    return new URL(path, window.location.href).href;
}

interface AppManifest {
    activities: {
        dhis: {
            href: string;
        };
    };
}

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const instance = Instance.build({ name: "Default", url: baseUrl });
        const api = getD2APiFromInstance(instance);
        if (isDev) {
            window.api = api;
        }

        const userSettings = await api.get<{ keyUiLocale: string }>("/userSettings").getData();
        configI18n(userSettings);

        const providerProps: Omit<React.ComponentProps<typeof Provider>, "children"> = {
            config: { baseUrl: baseUrl, apiVersion: 30 },
            offlineInterface: null,
            plugin: false,
            parentAlertsAdd: null,
            showAlertsInPlugin: false,
        };

        ReactDOM.render(
            <React.StrictMode>
                <Provider {...providerProps}>
                    <PresentationLoader />
                </Provider>
            </React.StrictMode>,
            document.getElementById("root")
        );
    } catch (err: any) {
        console.error(err);
        const feedback = err.toString().match("Unable to get schemas") ? (
            <h3 style={{ margin: 20 }}>
                Login to {baseUrl}
                {` ${baseUrl}`}
            </h3>
        ) : (
            <h3>{err.toString()}</h3>
        );
        ReactDOM.render(<div>{feedback}</div>, document.getElementById("root"));
    }
}

main();
