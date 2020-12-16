import React, { Suspense } from "react";
import { D2Api } from "../types/d2-api";

const App = React.lazy(() => {
    switch (process.env.REACT_APP_PRESENTATION_TYPE) {
        case "widget": {
            return import("./widget/WidgetApp");
        }
        default: {
            return import("./webapp/WebApp");
        }
    }
});

export const PresentationLoader: React.FC<{ api: D2Api }> = ({ api }) => {
    return (
        <Suspense fallback={null}>
            <App api={api} />
        </Suspense>
    );
};
