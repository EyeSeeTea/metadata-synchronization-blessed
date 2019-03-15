import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withStyles } from "@material-ui/core/styles";

import { Button } from "@material-ui/core";

const styles = () => ({
    button: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
        height: 36,
        width: 140,
        borderRadius: 0,
        marginRight: 20,
        marginLeft: 0,
    },
});

class SaveButton extends React.Component {
    static propTypes = {
        isSaving: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
    };

    render() {
        const { isSaving, onClick, classes, ...rest } = this.props;
        const buttonText = isSaving ? i18n.t("Saving...") : i18n.t("Save");
        return (
            <Button
                onClick={onClick}
                variant="contained"
                disabled={isSaving}
                className={classes.button}
                {...rest}
            >
                {buttonText}
            </Button>
        );
    }
}

export default withStyles(styles)(SaveButton);
