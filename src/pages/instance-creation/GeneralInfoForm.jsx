import i18n from "@dhis2/d2-i18n";
import { TextField } from "@dhis2/d2-ui-core";
import { FormBuilder, Validators } from "@dhis2/d2-ui-forms";
import { Card, CardContent } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { ApiContext } from "d2-api";
import { withSnackbar } from "d2-ui-components";
import _ from "lodash";
import RaisedButton from "material-ui/RaisedButton/RaisedButton";
import PropTypes from "prop-types";
import React from "react";
import { withRouter } from "react-router-dom";
import { getValidationMessages } from "../../utils/validations";
import isFormValid from "./FieldValidator";
import SaveButton from "./SaveButton";

const styles = () => ({
    formContainer: {
        paddingRight: 70,
        paddingLeft: 70,
        paddingBottom: 30,
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        paddingTop: 30,
    },
    actionButtonsContainer: {
        marginTop: 10,
    },
    metadataMappingButton: {
        margin: 16,
    },
});

class GeneralInfoForm extends React.Component {
    static contextType = ApiContext;
    static propTypes = {
        instance: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        cancelAction: PropTypes.func.isRequired,
    };

    state = {
        isSaving: false,
        passwordChanged: false,
    };

    setFormReference = formReference => {
        this.formReference = formReference;
    };

    onUpdateField = (fieldName, newValue) => {
        const { instance, onChange } = this.props;
        let newInstance;

        switch (fieldName) {
            case "name":
                newInstance = instance.setName(newValue);
                break;
            case "url":
                newInstance = instance.setUrl(newValue);
                break;
            case "username":
                newInstance = instance.setUsername(newValue);
                break;
            case "password":
                this.setState({ passwordChanged: true });
                newInstance = instance.setPassword(newValue);
                break;
            case "description":
                newInstance = instance.setDescription(newValue);
                break;
            default:
                console.error(`Field not implemented: ${fieldName}`);
                newInstance = null;
        }
        if (newInstance !== null) onChange(newInstance);
    };

    generateFields = () => {
        const { instance } = this.props;
        return [
            {
                name: "name",
                value: instance.name,
                component: TextField,
                props: {
                    floatingLabelText: `${i18n.t("Server name")} (*)`,
                    style: { width: "100%" },
                    changeEvent: "onBlur",
                    "data-test": "name",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return Validators.isRequired(value);
                        },
                    },
                ],
            },
            {
                name: "description",
                value: instance.description,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Description"),
                    style: { width: "100%" },
                    changeEvent: "onBlur",
                    "data-test": "description",
                },
                validators: [],
            },
            {
                name: "url",
                value: instance.url,
                component: TextField,
                props: {
                    floatingLabelText: `${i18n.t("URL endpoint")} (*)`,
                    style: { width: "100%" },
                    changeEvent: "onBlur",
                    "data-test": "url",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return Validators.isRequired(value);
                        },
                    },
                    {
                        message: i18n.t("Field should be an url"),
                        validator(value) {
                            return Validators.isUrl(value);
                        },
                    },
                ],
            },
            {
                name: "username",
                value: instance.username,
                component: TextField,
                props: {
                    floatingLabelText: `${i18n.t("Username")} (*)`,
                    style: { width: "100%" },
                    changeEvent: "onBlur",
                    "data-test": "username",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return Validators.isRequired(value);
                        },
                    },
                ],
            },
            {
                name: "password",
                value: this.state.passwordChanged ? instance.password : "",
                component: TextField,
                props: {
                    floatingLabelText: `${i18n.t("Password")} (*)`,
                    style: { width: "100%" },
                    changeEvent: "onBlur",
                    type: "password",
                    autoComplete: "new-password",
                    "data-test": "password",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return !!instance.id || Validators.isRequired(value);
                        },
                    },
                ],
            },
        ];
    };

    testConnection = async () => {
        const { instance } = this.props;
        const fields = this.generateFields();
        const formErrors = isFormValid(fields, this.formReference);
        if (formErrors.length > 0) {
            this.props.snackbar.error(
                i18n.t("Please fix the issues before testing the connection")
            );
            return;
        }
        const connectionErrors = await instance.check();
        if (!connectionErrors.status) {
            this.props.snackbar.error(connectionErrors.error.message, {
                autoHideDuration: null,
            });
        } else {
            this.props.snackbar.success(i18n.t("Connected successfully to instance"));
        }
    };

    goToMetadataMapping = async () => {
        const { instance, history } = this.props;

        history.push(`/instances/mapping/${instance.id}`);
    };

    saveAction = async () => {
        const { api } = this.context;
        const { instance } = this.props;
        const fields = this.generateFields();
        const formErrors = isFormValid(fields, this.formReference);
        if (formErrors.length > 0) {
            this.props.snackbar.error(i18n.t("Please fix the issues before saving"));
            return;
        }
        const fieldKeys = fields.map(field => field.name);
        const errorMessages = await getValidationMessages(api, instance, fieldKeys);

        if (!_(errorMessages).isEmpty()) {
            this.props.snackbar.error(errorMessages.join("\n"), {
                autoHideDuration: null,
            });
        } else {
            this.setState({ isSaving: true });
            await instance.save(api);
            this.setState({ isSaving: false });
            this.props.history.push("/instances");
        }
    };

    render() {
        const { classes, instance } = this.props;
        const fields = this.generateFields();

        return (
            <Card>
                <CardContent className={classes.formContainer}>
                    <FormBuilder
                        fields={fields}
                        onUpdateField={this.onUpdateField}
                        ref={this.setFormReference}
                    />
                    <div className={classes.buttonContainer}>
                        <div>
                            <SaveButton
                                onClick={this.saveAction}
                                isSaving={this.state.isSaving}
                                data-test={"save-button"}
                            />
                            <RaisedButton
                                label={i18n.t("Cancel")}
                                onClick={this.props.cancelAction}
                                data-test={"cancel-button"}
                            />
                        </div>
                        <div className={classes.actionButtonsContainer}>
                            {instance.id && (
                                <RaisedButton
                                    label={i18n.t("Metadata mapping")}
                                    onClick={this.goToMetadataMapping}
                                    data-test={"metadata-mapping-button"}
                                    className={classes.metadataMappingButton}
                                />
                            )}
                            <RaisedButton
                                label={i18n.t("Test Connection")}
                                onClick={this.testConnection}
                                data-test={"test-connection-button"}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(GeneralInfoForm)));
