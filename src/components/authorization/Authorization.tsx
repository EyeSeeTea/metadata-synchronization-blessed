import React from "react";

const withAuthorization = (authorizeFunctions: any) => (WrappedComponent: any) => {
    return class WithAuthorization extends React.Component {
        isAuthorized = async () => {
            const authorizedResults = await Promise.all(authorizeFunctions);

            debugger;
            return authorizedResults.includes(true);
        };

        render() {
            debugger;
            if (this.isAuthorized()) {
                return <WrappedComponent {...this.props} />;
            } else {
                return <h1>Unauthorized!</h1>;
            }
        }
    };
};

export default withAuthorization;
