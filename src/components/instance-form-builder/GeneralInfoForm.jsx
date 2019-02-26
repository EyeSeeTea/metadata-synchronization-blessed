import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withRouter } from "react-router-dom";

import { TextField } from "@dhis2/d2-ui-core";
import { FormBuilder } from "@dhis2/d2-ui-forms";
import { Validators } from "@dhis2/d2-ui-forms";
import { Card, CardContent } from "@material-ui/core";
import RaisedButton from "material-ui/RaisedButton/RaisedButton";
import { withSnackbar } from "d2-ui-components";

import SaveButton from "./SaveButton";
import isFormValid from "./FieldValidator";

class GeneralInfoForm extends React.Component {
    state = {
        isSaving: false,
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        instance: PropTypes.object.isRequired,
        isEdit: PropTypes.bool,
        originalInstance: PropTypes.object,
        snackbar: PropTypes.object.isRequired,
        cancelAction: PropTypes.func.isRequired,
    };

    setFormReference = formReference => {
        this.formReference = formReference;
    };

    onUpdateField = (fieldName, newValue) => {
        const { instance, onChange } = this.props;
        let newInstance;

        switch (fieldName) {
            case "id":
                newInstance = instance.setId(newValue);
                break;
            case "url":
                newInstance = instance.setUrl(newValue);
                break;
            case "username":
                newInstance = instance.setUsername(newValue);
                break;
            case "password":
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

    render() {
        const { instance } = this.props;
        const fields = [
            {
                name: "id",
                value: instance.id,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Server name (*)"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    "data-field": "id",
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
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    "data-field": "description",
                },
                validators: [],
            },
            {
                name: "url",
                value: instance.url,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("URL endpoint (*)"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    "data-field": "url",
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
                    floatingLabelText: i18n.t("Username (*)"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    "data-field": "username",
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
                value: instance.password,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Password (*)"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    type: "password",
                    autoComplete: "new-password",
                    "data-field": "password",
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
        ];

        const saveAction = () => {
            const formErrors = isFormValid(fields, this.formReference);
            if (formErrors.length > 0) {
                this.props.snackbar.error(i18n.t("Please fix the issues before saving"));
                return;
            }

            this.setState({ isSaving: true });

            this.props.originalInstance.remove(this.props.d2).then(() => {
                this.props.instance.save(this.props.d2, this.props.isEdit).then(() => {
                    this.setState({ isSaving: false });
                    this.props.history.push("/instance-configurator");
                });
            });
        };

        return (
            <Card>
                <CardContent>
                    <FormBuilder
                        fields={fields}
                        onUpdateField={this.onUpdateField}
                        ref={this.setFormReference}
                    />
                    <SaveButton onClick={saveAction} isSaving={this.state.isSaving} />
                    <RaisedButton label={i18n.t("Cancel")} onClick={this.props.cancelAction} />
                </CardContent>
            </Card>
        );
    }
}

export default withSnackbar(withRouter(GeneralInfoForm));
