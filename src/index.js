import { Provider } from "@dhis2/app-runtime";
import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
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

// Presentation layer is loaded with code-splitting for performance
async function getPresentation() {
    if (process.env.REACT_APP_DASHBOARD_WIDGET) {
        return () => <h1>Hello World, widget!</h1>;
    } else {
        const { default: App } = await import("./pages/app/App");
        return App;
    }
}

async function main() {
    const config = {
        baseUrl: await getBaseUrl(),
        apiVersion: "30",
    };
    try {
        const App = await getPresentation();
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
