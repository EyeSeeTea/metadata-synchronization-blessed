import React from "react";
import { Route, RouteComponentProps } from "react-router-dom";
import WithSession from "./WithSession";
import WithAuthorization from "./WithAuthorization";
import { RouteWithSessionProps } from "./RouteWithSession";

export interface RouteWithSessionAndAuthProps extends RouteWithSessionProps {
    authorize: (props: RouteComponentProps) => Promise<boolean>;
}

const RouteWithSessionAndAuth: React.FC<RouteWithSessionAndAuthProps> = ({ path, render, authorize }) => {
    const key = path?.toString() ?? "";

    return (
        <Route
            path={path}
            render={props => (
                <WithSession key={key}>
                    <WithAuthorization authorize={() => authorize(props)}>{render(props)}</WithAuthorization>
                </WithSession>
            )}
        />
    );
};

export default RouteWithSessionAndAuth;
