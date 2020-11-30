import { Provider } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import axios from "axios";
import { D2Api } from "d2-api/2.30";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";
import { PresentationLoader } from "./presentation/PresentationLoader";

async function getBaseUrl() {
    if (process.env.NODE_ENV === "development") {
        const baseUrl = process.env.REACT_APP_DHIS2_BASE_URL || "http://localhost:8080";
        console.info(`[DEV] DHIS2 instance: ${baseUrl}`);
        return baseUrl.replace(/\/*$/, "");
    } else {
        const { data: manifest } = await axios.get("manifest.webapp");
        return manifest.activities.dhis.href;
    }
}

const isLangRTL = code => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return _(langs).includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};

async function main() {
    const baseUrl = await getBaseUrl();

    try {
        const api = new D2Api({ baseUrl, backend: "fetch" });
        const userSettings = await api.get("/userSettings").getData();
        if (typeof userSettings === "string") throw new Error("User needs to log in");
        configI18n(userSettings);
    } catch (err) {
        ReactDOM.render(
            <div>
                <h3>
                    <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                        Login
                    </a>
                    {` ${baseUrl}`}
                </h3>
            </div>,
            document.getElementById("root")
        );
        return;
    }

    try {
        ReactDOM.render(
            <Provider config={{ baseUrl, apiVersion: "30" }}>
                <PresentationLoader />
            </Provider>,
            document.getElementById("root")
        );
    } catch (err) {
        ReactDOM.render(<div>{err.toString()}</div>, document.getElementById("root"));
    }
}

main();
