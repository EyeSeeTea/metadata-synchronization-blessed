import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, LinearProgress, withStyles } from "@material-ui/core";
import i18n from "@dhis2/d2-i18n";

const LiEntry = ({ label, value, children }) => {
    return (
        <li key={label}>
            {label}
            {value || children ? ": " : ""}
            {value}
            {children}
        </li>
    );
};

const styles = () => ({
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
});

const SaveStep = props => {
    const { syncRule, classes } = props;
    const [isSaving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const cancel = () => {};
    const save = () => {};

    return (
        <React.Fragment>
            <ul>
                <LiEntry label={i18n.t("Name")} value={syncRule.name} />

                <LiEntry label={i18n.t("Description")} value={syncRule.description} />
            </ul>

            <Button onClick={cancel} variant="contained">
                {i18n.t("Cancel")}
            </Button>
            <Button className={classes.saveButton} onClick={save} variant="contained">
                {i18n.t("Save")}
            </Button>

            {isSaving && <LinearProgress />}

            <pre>{errorMessage}</pre>
        </React.Fragment>
    );
};

SaveStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    classes: PropTypes.object.isRequired,
};

SaveStep.defaultProps = {};

export default withStyles(styles)(SaveStep);
