import React, { Suspense } from "react";

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

export const PresentationLoader: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <App />
        </Suspense>
    );
};
