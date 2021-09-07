import { makeStyles, Tooltip } from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import _ from "lodash";
import React, { ReactNode } from "react";
import i18n from "../../../../../locales";

export interface MenuCardProps {
    name: string;
    description?: string;
    icon?: ReactNode;
    isVisible?: boolean;
    addAction?: () => void;
    listAction?: () => void;
}

export interface MenuCardTitleProps {
    text: string;
    icon?: ReactNode;
}

const useStyles = makeStyles({
    card: {
        padding: "0",
        margin: ".5rem",
        float: "left",
        width: "230px",
    },
    content: {
        height: "120px",
        padding: ".5rem 1rem",
        fontSize: "14px",
    },
    actions: {
        marginLeft: "auto",
    },
    header: {
        padding: "1rem",
        height: "auto",
        borderBottom: "1px solid #ddd",
        cursor: "pointer",
    },
    headerText: {
        fontSize: "15px",
        fontWeight: 500,
    },
    cardTitle: {
        display: "flex",
    },
    icon: {
        marginLeft: "auto",
        display: "inline",
    },
});

const MenuCard: React.FC<MenuCardProps> = ({ name, icon, description, isVisible, addAction, listAction }) => {
    const classes = useStyles();

    if (isVisible === false) return null;

    return (
        <Card className={classes.card}>
            <CardHeader
                onClick={listAction ?? addAction ?? _.noop}
                classes={{ root: classes.header, title: classes.headerText }}
                title={<MenuCardTitle text={name} icon={icon} />}
            />

            <CardContent className={classes.content}>{description}</CardContent>

            <CardActions disableSpacing>
                <div className={classes.actions}>
                    {addAction && (
                        <Tooltip title={i18n.t("Add")} placement="top">
                            <IconButton key="add" onClick={addAction}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {listAction && (
                        <Tooltip title={i18n.t("List")} placement="top">
                            <IconButton key="list" onClick={listAction}>
                                <ViewListIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </div>
            </CardActions>
        </Card>
    );
};

const MenuCardTitle: React.FC<MenuCardTitleProps> = ({ text, icon }) => {
    const classes = useStyles();

    return (
        <span className={classes.cardTitle}>
            {text}
            {!!icon && <div className={classes.icon}>{icon}</div>}
        </span>
    );
};

export default MenuCard;
