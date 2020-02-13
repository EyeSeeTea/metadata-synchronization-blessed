import React from "react";
import { Route, RouteComponentProps } from "react-router-dom";
import WithSession from "./WithSession";

export interface RouteWithSessionProps {
    render: (props: RouteComponentProps) => React.ReactNode;
    path?: string | string[];
}

const RouteWithSession: React.FC<RouteWithSessionProps> = ({ path, render }) => {
    const key = path?.toString() ?? "";

    return (
        <Route path={path} render={props => <WithSession key={key}>{render(props)}</WithSession>} />
    );
};

export default RouteWithSession;
