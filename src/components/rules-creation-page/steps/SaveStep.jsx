import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, LinearProgress, withStyles } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";

import { getMetadata } from "../../../utils/synchronization";

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
    const { d2, syncRule, classes, history } = props;
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [isSaving] = useState(false);
    const [errorMessage] = useState();

    const openCancelDialog = () => setCancelDialogOpen(true);

    const closeCancelDialog = () => setCancelDialogOpen(false);

    const cancel = () => history.push("/synchronization-rules");

    const save = async () => {
        syncRule.metadata = await getMetadata(d2, syncRule.selectedIds, "id");
        await syncRule.save(d2);
        cancel();
    };

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={cancelDialogOpen}
                onSave={cancel}
                onCancel={closeCancelDialog}
                title={i18n.t("Cancel Sync Rule Creation?")}
                description={i18n.t(
                    "You are about to exit the Sync Rule Creation Wizard. All your changes will be lost. Are you sure you want to proceed?"
                )}
                saveText={i18n.t("Yes")}
            />

            <ul>
                <LiEntry label={i18n.t("Name")} value={syncRule.name} />

                <LiEntry label={i18n.t("Description")} value={syncRule.description} />
            </ul>

            <Button onClick={openCancelDialog} variant="contained">
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
    history: PropTypes.object.isRequired,
};

SaveStep.defaultProps = {};

export default withRouter(withStyles(styles)(SaveStep));
