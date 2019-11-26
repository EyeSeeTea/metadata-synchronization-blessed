import React from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import { Provider } from "@dhis2/app-runtime";

import App from "./pages/app/App";
import "./locales";

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

async function main() {
    const config = {
        baseUrl: await getBaseUrl(),
        apiVersion: "30",
    };
    try {
        ReactDOM.render(
            <Provider config={config}>
                <App />
            </Provider>,
            document.getElementById("root")
        );
    } catch (err) {
        console.error(err);
        ReactDOM.render(<div>{err.toString()}</div>, document.getElementById("root"));
    }
}

main();
