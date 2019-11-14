import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";
import axios from "axios";
import { config, getManifest, getUserSettings, init } from "d2";
import { HashRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { DataProvider } from "@dhis2/app-runtime";
import "font-awesome/css/font-awesome.min.css";
import { D2ApiDefault } from "d2-api";
import { ApiContext } from "./next/context";

import App from "./components/app/App";
import "./locales";

function isLangRTL(code) {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
}

function configI18n(userSettings) {
    const uiLocale = userSettings.keyUiLocale;

    if (uiLocale && uiLocale !== "en") {
        config.i18n.sources.add(`./i18n/i18n_module_${uiLocale}.properties`);
    }

    config.i18n.sources.add("./i18n/i18n_module_en.properties");
    document.documentElement.setAttribute("dir", isLangRTL(uiLocale) ? "rtl" : "ltr");

    i18n.changeLanguage(uiLocale);
}

async function getBaseUrl() {
    if (process.env.NODE_ENV === "development") {
        const envVariable = "REACT_APP_DHIS2_BASE_URL";
        const defaultServer = "http://localhost:8080";
        const baseUrl = process.env[envVariable] || defaultServer;
        console.info(`[DEV] DHIS2 instance: ${baseUrl}`);
        return baseUrl;
    } else {
        const manifest = await getManifest("./manifest.webapp");
        return manifest.getBaseUrl();
    }
}

async function main() {
    const baseUrl = await getBaseUrl();
    const apiUrl = baseUrl.replace(/\/*$/, "") + "/api";
    try {
        const d2 = await init({ baseUrl: apiUrl });
        window.d2 = d2; // Make d2 available in the console
        const userSettings = await getUserSettings();
        configI18n(userSettings);
        const appConfig = await axios.get("app-config.json").then(res => res.data);
        const api = new D2ApiDefault({ baseUrl });

        ReactDOM.render(
            <HashRouter>
                <DataProvider baseUrl={baseUrl} apiVersion={d2.system.version.minor}>
                    <ApiContext.Provider value={{ d2, api }}>
                        <App d2={d2} appConfig={appConfig} />
                    </ApiContext.Provider>
                </DataProvider>
            </HashRouter>,
            document.getElementById("root")
        );
    } catch (err) {
        console.error(err);
        const message = err.toString().match("Unable to get schemas") ? (
            <div>
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    Login
                </a>{" "}
                {baseUrl}
            </div>
        ) : (
            err.toString()
        );
        ReactDOM.render(<div>{message}</div>, document.getElementById("root"));
    }
}

main();
