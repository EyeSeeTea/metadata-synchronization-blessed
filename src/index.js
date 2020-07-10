import { Provider } from "@dhis2/app-runtime";
import i18n from "@dhis2/d2-i18n";
import axios from "axios";
import { D2Api } from "d2-api/2.30";
import _ from "lodash";
import React from "react";
import ReactDOM from "react-dom";

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

// Presentation layer is loaded with code-splitting for performance
async function getPresentation() {
    if (process.env.REACT_APP_DASHBOARD_WIDGET) {
        const { default: App } = await import("./presentation/widget/WidgetApp");
        return App;
    } else {
        const { default: App } = await import("./presentation/webapp/WebApp");
        return App;
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
        const api = new D2Api({ baseUrl });
        const userSettings = await api.get("/userSettings").getData();
        if (typeof userSettings === "string") {
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
        } else {
            configI18n(userSettings);

            const App = await getPresentation();
            ReactDOM.render(
                <Provider config={{ baseUrl, apiVersion: "30" }}>
                    <App />
                </Provider>,
                document.getElementById("root")
            );
        }
    } catch (err) {
        ReactDOM.render(<div>{err.toString()}</div>, document.getElementById("root"));
    }
}

main();
