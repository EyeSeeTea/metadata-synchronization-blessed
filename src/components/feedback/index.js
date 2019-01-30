import React from "react";
import feedbackContext from "./context";

export const levels = Object.freeze({
    SUCCESS: "success",
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
});

export function withFeedback(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withFeedback${WrappedComponent.displayName}`;

        static contextType = feedbackContext;

        openFeedback = (...args) => {
            this.context.openSnackbar(...args);
        };

        render() {
            return <WrappedComponent {...this.props} feedback={this.openFeedback} />;
        }
    };
}
