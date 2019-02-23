import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import memoize from "nano-memoize";
import i18n from "@dhis2/d2-i18n";
import { withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import Button from "@material-ui/core/Button";
import { IconButton } from "@material-ui/core";
import Icon from "@material-ui/core/Icon";
import { withFeedback, levels } from "../feedback";
import {DialogHandler} from "d2-ui-components";

const styles = theme => ({
    root: {
        width: "100%",
    },
    button: {
        margin: theme.spacing.unit,
        marginRight: 5,
        padding: 10,
    },
    buttonDisabled: {
        color: "grey !important",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "flex-end",
        paddingTop: 10,
    },
    stepButton: {
        width: "auto",
    },
    contents: {
        margin: 10,
        padding: 20,
    },
    messages: {
        padding: 0,
        listStyleType: "none",
        color: "red",
    },
    stepper: {
        marginLeft: 10,
        marginRight: 10,
    },
});

class Wizard extends React.Component {
    state = {
        currentStepKey: this.props.initialStepKey,
        messages: [],
        lastClickableStepIndex: 0,
    };

    static propTypes = {
        initialStepKey: PropTypes.string.isRequired,
        onStepChangeRequest: PropTypes.func.isRequired,
        useSnackFeedback: PropTypes.bool,
        feedback: PropTypes.func,
        steps: PropTypes.arrayOf(
            PropTypes.shape({
                key: PropTypes.string.isRequired,
                label: PropTypes.string.isRequired,
                component: PropTypes.func.isRequired,
            })
        ).isRequired,
    };

    static defaultProps = {
        useSnackFeedback: false,
    };

    getAdjacentSteps = () => {
        const { steps } = this.props;
        const { currentStepKey } = this.state;
        const index = _(steps).findIndex(step => step.key === currentStepKey);
        const prevStepKey = index >= 1 ? steps[index - 1].key : null;
        const nextStepKey = index >= 0 && index < steps.length - 1 ? steps[index + 1].key : null;
        return { prevStepKey, nextStepKey };
    };

    nextStep = () => {
        const { currentStepKey } = this.state;
        const stepsByKey = _.keyBy(this.props.steps, "key");
        const currentStep = stepsByKey[currentStepKey];
        const { nextStepKey } = this.getAdjacentSteps();
        const nextStep = stepsByKey[nextStepKey];
        const errorMessages = this.props.onStepChangeRequest(currentStep, nextStep);

        if (_(errorMessages).isEmpty()) {
            this.setStep(nextStepKey);
        } else {
            if (this.props.useSnackFeedback) {
                this.props.feedback(levels.ERROR, errorMessages.join("\n"), {
                    autoHideDuration: null,
                });
            } else {
                this.setState({ messages: errorMessages });
            }
        }
    };

    prevStep = () => {
        const { prevStepKey } = this.getAdjacentSteps();
        this.setStep(prevStepKey);
    };

    renderNavigationButton = ({ stepKey, onClick, label }) => {
        return (
            <Button
                variant="contained"
                classes={{ disabled: this.props.classes.buttonDisabled }}
                disabled={!stepKey}
                className={this.props.classes.button}
                onClick={onClick}
            >
                {label}
            </Button>
        );
    };

    setStep = stepKey => {
        const index = _(this.props.steps).findIndex(step => step.key === stepKey);
        const lastClickableStepIndex = Math.max(this.state.lastClickableStepIndex, index);
        this.setState({ currentStepKey: stepKey, lastClickableStepIndex, messages: [] });
    };

    onStepClicked = memoize(stepKey => () => {
        this.setStep(stepKey);
    });

    renderHelp = ({ step }) => {
        const Button = ({ onClick }) => (
            <IconButton tooltip={i18n.t("Help")} onClick={onClick}>
                <Icon color="primary">help</Icon>
            </IconButton>
        );

        return (
            <DialogHandler
                buttonComponent={Button}
                title={`${step.label} - ${i18n.t("Help")}`}
                contents={step.help}
            />
        );
    };

    renderFeedbackMessages = () => {
        const { classes, useSnackFeedback } = this.props;
        const { messages } = this.state;

        if (useSnackFeedback || messages.length === 0) {
            return null;
        } else {
            return (
                <div className="messages">
                    <ul className={classes.messages}>
                        {messages.map((message, index) => (
                            <li key={index}>{message}</li>
                        ))}
                    </ul>
                </div>
            );
        }
    };

    render() {
        const { classes, steps } = this.props;
        const { currentStepKey, lastClickableStepIndex } = this.state;
        const index = _(steps).findIndex(step => step.key === currentStepKey);
        const currentStepIndex = index >= 0 ? index : 0;
        const currentStep = steps[currentStepIndex];
        const { prevStepKey, nextStepKey } = this.getAdjacentSteps();
        const NavigationButton = this.renderNavigationButton;
        const Help = this.renderHelp;
        const FeedbackMessages = this.renderFeedbackMessages;

        return (
            <div className={classes.root}>
                <Stepper nonLinear={true} activeStep={currentStepIndex} className={classes.stepper}>
                    {steps.map((step, index) => (
                        <Step
                            key={step.key}
                            completed={false}
                            disabled={index > lastClickableStepIndex}
                        >
                            <StepButton
                                key={step.key}
                                data-test-current={currentStep === step}
                                onClick={this.onStepClicked(step.key)}
                                classes={{ root: classes.stepButton }}
                            >
                                {step.label}
                            </StepButton>

                            {step.help && step === currentStep ? <Help step={step} /> : null}
                        </Step>
                    ))}
                </Stepper>

                <FeedbackMessages />

                <Paper className={classes.contents} data-wizard-contents={true}>
                    {<currentStep.component {...currentStep.props} />}
                    <div className={classes.buttonContainer}>
                        <NavigationButton
                            stepKey={prevStepKey}
                            onClick={this.prevStep}
                            label={"← " + i18n.t("Previous")}
                        />

                        <NavigationButton
                            stepKey={nextStepKey}
                            onClick={this.nextStep}
                            label={i18n.t("Next") + " →"}
                        />
                    </div>
                </Paper>
            </div>
        );
    }
}

export default withFeedback(withStyles(styles)(Wizard));
