import React from "react";
import { Route, RouteComponentProps } from "react-router-dom";
import WithSession from "./WithSession";

export interface RouteWithSessionProps {
    render: (props: RouteComponentProps) => React.ReactNode;
    path?: string | string[];
    exact?: boolean;
}

const RouteWithSession: React.FC<RouteWithSessionProps> = ({ path, render, exact }) => {
    const key = path?.toString() ?? "";

    return <Route path={path} exact={exact} render={props => <WithSession key={key}>{render(props)}</WithSession>} />;
};

export default RouteWithSession;
