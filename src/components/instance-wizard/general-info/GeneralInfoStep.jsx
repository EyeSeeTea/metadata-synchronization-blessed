import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";

import { TextField } from "@dhis2/d2-ui-core";
import { FormBuilder } from "@dhis2/d2-ui-forms";
import { Validators } from "@dhis2/d2-ui-forms";
import { Card, CardContent } from "@material-ui/core";

class GeneralInfoStep extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        instance: PropTypes.object.isRequired,
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
                newInstance = instance.setPassword(newValue);
                break;
            case "description":
                newInstance = instance.setDescription(newValue);
                break;
            default:
                console.error(`Field not implemented: ${fieldName}`);
                newInstance = null;
        }
        if (newInstance) onChange(newInstance);
    };

    render() {
        const { instance } = this.props;
        const fields = [
            {
                name: "name",
                value: instance.name,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Name"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    "data-field": "name",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return Validators.isRequired(value);
                        },
                    },
                ]
            },
            {
                name: "url",
                value: instance.url,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Endpoint"),
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
                ]
            },
            {
                name: "username",
                value: instance.username,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Username"),
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
                ]
            },
            {
                name: "password",
                value: instance.password,
                component: TextField,
                props: {
                    floatingLabelText: i18n.t("Password"),
                    style: { width: "33%" },
                    changeEvent: "onBlur",
                    type: "password",
                    autocomplete: "new-password",
                    "data-field": "password",
                },
                validators: [
                    {
                        message: i18n.t("Field cannot be blank"),
                        validator(value) {
                            return Validators.isRequired(value);
                        },
                    },
                ]
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
                }
            }
        ];

        return (
            <Card>
                <CardContent>
                    <FormBuilder fields={fields} onUpdateField={this.onUpdateField} />
                </CardContent>
            </Card>
        );
    }
}

export default GeneralInfoStep;
