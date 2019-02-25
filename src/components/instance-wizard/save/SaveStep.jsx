import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { Button, LinearProgress } from "@material-ui/core";
import { withFeedback, levels } from "../../feedback";
import ConfirmationDialog from "../../confirmation-dialog/ConfirmationDialog";

const styles = theme => ({
    wrapper: {
        padding: 5,
    },
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
    },
});

class SaveStep extends React.Component {
    state = {
        isSaving: false,
        errorMessage: [],
        dialogOpen: false,
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        instance: PropTypes.object.isRequired,
    };

    save = async () => {
        const { instance } = this.props;
        this.setState({ isSaving: true, errorMessage: "" });
        const saveResponse = await instance.save(this.props.d2);
        this.setState({ isSaving: false });

        if (saveResponse.status) {
            this.props.feedback(
                levels.SUCCESS,
                i18n.t("Instance created: {{name}}", { name: instance.name })
            );
            this.props.history.push("/instance-configurator");
        } else {
            this.setState({ errorMessage: saveResponse.error });
            this.props.feedback(levels.ERROR, i18n.t("Error saving instance"));
        }
    };

    cancel = () => {
        this.setState({ dialogOpen: true });
    };

    confirmCancel = () => {
        this.setState({ dialogOpen: false });
        this.props.history.push("/instance-configurator");
    };

    dialogCancel = () => {
        this.setState({ dialogOpen: false });
    };

    renderLiEntry = ({ label, value }) => {
        return (
            <li key={label}>
                {label}: <i>{value || "-"}</i>
            </li>
        );
    };

    render() {
        const { classes, instance } = this.props;
        const { errorMessage, isSaving, dialogOpen } = this.state;
        const LiEntry = this.renderLiEntry;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    dialogOpen={dialogOpen}
                    handleConfirm={this.confirmCancel}
                    handleCancel={this.dialogCancel}
                    title={i18n.t("Cancel Instance Creation?")}
                    contents={i18n.t(
                        "You are about to exit the instance creation wizard. All your changes will be lost. Are you sure?"
                    )}
                />
                <div className={classes.wrapper}>
                    <h3>{i18n.t("Setup is finished. Press the button Save to save the data")}</h3>

                    <ul>
                        <LiEntry label={i18n.t("Name")} value={instance.name} />
                        <LiEntry label={i18n.t("Endpoint")} value={instance.url} />
                        <LiEntry label={i18n.t("Username")} value={instance.username} />
                        <LiEntry label={i18n.t("Description")} value={instance.description} />
                    </ul>

                    <Button onClick={this.cancel} variant="contained">
                        {i18n.t("Cancel")}
                    </Button>
                    <Button className={classes.saveButton} onClick={this.save} variant="contained">
                        {i18n.t("Save")}
                    </Button>

                    {isSaving && <LinearProgress />}

                    <pre>{errorMessage}</pre>
                </div>
            </React.Fragment>
        );
    }
}

export default withFeedback(withRouter(withStyles(styles)(SaveStep)));
