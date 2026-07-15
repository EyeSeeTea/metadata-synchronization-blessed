import React, { Suspense } from "react";
import { config } from "../utils/Config";

const App = React.lazy(() => {
    switch (config.presentationType) {
        case "widget": {
            return import("./widget/WidgetApp");
        }
        default: {
            return import("./webapp/WebApp");
        }
    }
});

export const PresentationLoader: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <App />
        </Suspense>
    );
};
