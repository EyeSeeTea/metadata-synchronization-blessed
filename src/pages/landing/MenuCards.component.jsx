import React from "react";
import Card from "material-ui/Card/Card";
import CardHeader from "material-ui/Card/CardHeader";
import CardText from "material-ui/Card/CardText";
import CardActions from "material-ui/Card/CardActions";
import IconButton from "material-ui/IconButton/IconButton";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";

export default function MenuCards({ menuItems }) {

    const renderCard = (details, index) => {
        const cardStyle = {
            padding: "0",
            margin: ".5rem",
            float: "left",
            width: "230px",
        };

        const headerStyle = {
            padding: "1rem",
            height: "auto",
            borderBottom: "1px solid #ddd",
            cursor: "pointer",
        };

        const textStyle = {
            height: "85px",
            padding: ".5rem 1rem",
        };

        const actionStyle = {
            textAlign: "right",
        };

        const styles = {
            cardHeaderText: {
                paddingRight: 0,
            },
        };

        const actionButtons = [];

        if (details.canCreate) {
            actionButtons.push(
                <IconButton
                    key="add"
                    iconClassName="material-icons"
                    tooltip={i18n.t("add")}
                    tooltipPosition="top-center"
                    onClick={details.add}
                >
                    &#xE145;
                </IconButton>
            );
        }

        actionButtons.push(
            <IconButton
                key="list"
                iconClassName="material-icons"
                tooltip={i18n.t("list")}
                tooltipPosition="top-center"
                onClick={details.list}
            >
                &#xE8EF;
            </IconButton>
        );

        return (
            <Card key={index} style={cardStyle}>
                <CardHeader
                    onClick={details.list}
                    style={headerStyle}
                    title={details.name}
                    textStyle={styles.cardHeaderText}
                />
                <CardText style={textStyle}>{details.description}</CardText>
                <CardActions style={actionStyle}>{actionButtons}</CardActions>
            </Card>
        );
    };

    return (
        <div>
            {menuItems.map(renderCard)}
            <div style={{ clear: "both" }} />
        </div>
    );
}

MenuCards.propTypes = {
    menuItems: PropTypes.array.isRequired,
};
