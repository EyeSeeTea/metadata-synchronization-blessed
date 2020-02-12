import React, { useState, useEffect } from "react";
import i18n from "../../locales";
import { Typography, CircularProgress, makeStyles } from "@material-ui/core";
import { useD2 } from "d2-api";
import { D2 } from "../../types/d2";

const useStyles = makeStyles({
    loading: {
        display: "flex",
        justifyContent: "center",
    },
});

const WithSession: React.FC = ({ children }) => {
    const d2 = useD2() as D2;
    const classes = useStyles();

    const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const api = d2.Api.getApi();
        api.get("/me?fields=id", {})
            .then((_data: any) => {
                setLoggedIn(true);
            })
            .catch((_err: any) => {
                setLoggedIn(false);
            });
    }, [d2.Api]);

    if (isLoggedIn === undefined) {
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
        );
    } else if (isLoggedIn === false) {
        return (
            <Typography variant="h6" component="h1">
                <a rel="noopener noreferrer" target="_blank" href={d2.Api.getApi().baseUrl}>
                    {i18n.t("Login")}
                </a>
                {` ${d2.Api.getApi().baseUrl}`}
            </Typography>
        );
    } else {
        return <React.Fragment>{children}</React.Fragment>;
    }
};

export default WithSession;
