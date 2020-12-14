import React, { useState, useEffect } from "react";
import i18n from "../../../../../locales";
import { Typography } from "@material-ui/core";

interface AuthorizationProps {
    authorize: () => Promise<boolean>;
}

const Authorization: React.FC<AuthorizationProps> = ({ authorize, children }) => {
    const [isAuthorize, setIsAuthorize] = useState<boolean>(true);

    useEffect(() => {
        authorize().then(setIsAuthorize);
    }, [authorize]);

    if (isAuthorize) {
        return <React.Fragment>{children}</React.Fragment>;
    } else {
        return (
            <Typography variant="h6" component="h1">
                {i18n.t("Unauthorized - You do not have permission to view this page.")}
            </Typography>
        );
    }
};

export default Authorization;
