import { makeStyles } from "@material-ui/core";
import React from "react";
import _ from "lodash";
import PageHeader from "../page-header/PageHeader";
import MenuCard, { MenuCardProps } from "./MenuCard";

const useStyles = makeStyles({
    container: {
        marginLeft: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 300,
        color: "rgba(0, 0, 0, 0.87)",
        padding: "15px 0px 15px",
        margin: 0,
    },
    clear: {
        clear: "both",
    },
});

export interface Card {
    title?: string;
    key: string;
    isVisible?: boolean;
    children: MenuCardProps[];
}

export interface LandingProps {
    cards: Card[];
    title?: string;
    onBackClick?: () => void;
}

export const Landing: React.FC<LandingProps> = ({ title, cards, onBackClick }) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            {!!title && <PageHeader title={title} onBackClick={onBackClick} />}

            <div className={classes.container} key="landing">
                {cards.map(
                    ({ key, title, isVisible = true, children }) =>
                        isVisible &&
                        isAnyChildVisible(children) && (
                            <div key={key}>
                                {!!title && <h1 className={classes.title}>{title}</h1>}

                                {children.map(props => (
                                    <MenuCard key={props.name} {...props} />
                                ))}

                                <div className={classes.clear} />
                            </div>
                        )
                )}
            </div>
        </React.Fragment>
    );
};

function isAnyChildVisible(children: MenuCardProps[]): boolean {
    return _.some(children, ({ isVisible = true }) => isVisible);
}
