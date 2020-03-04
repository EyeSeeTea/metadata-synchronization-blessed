import React, { useState, useEffect } from "react";
import i18n from "../../locales";
import { Typography, CircularProgress, makeStyles } from "@material-ui/core";
import { useD2Api } from "d2-api";

const useStyles = makeStyles({
    loading: {
        display: "flex",
        justifyContent: "center",
    },
});

const WithSession: React.FC = ({ children }) => {
    const api = useD2Api();
    const classes = useStyles();

    const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        api.currentUser
            .get({ fields: { id: true } })
            .getData()
            .then(() => setLoggedIn(true))
            .catch(() => setLoggedIn(false));
    }, [api]);

    if (isLoggedIn === undefined) {
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
        );
    } else if (isLoggedIn === false) {
        const { baseUrl } = api;
        return (
            <Typography variant="h6" component="h1">
                <a rel="noopener noreferrer" target="_blank" href={baseUrl}>
                    {i18n.t("Login")}
                </a>
                {` ${baseUrl}`}
            </Typography>
        );
    } else {
        return <React.Fragment>{children}</React.Fragment>;
    }
};

export default WithSession;
