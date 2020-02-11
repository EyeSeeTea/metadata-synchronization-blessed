import React from "react";
import WithSession from "./WithSession";
import WithAuthorization from "./WithAuthorization";

interface WithSessionAndAuthProps {
    authorize: () => Promise<boolean>;
}

const WithSessionAndAuth: React.FC<WithSessionAndAuthProps> = ({ authorize, children }) => {
    return (
        <WithSession>
            <WithAuthorization authorize={authorize}>{children}</WithAuthorization>
        </WithSession>
    );
};

export default WithSessionAndAuth;
