import React from "react";
import PropTypes from "prop-types";
import { FormBuilder, Validators } from "@dhis2/d2-ui-forms";
import { TextField } from "@dhis2/d2-ui-core";
import i18n from "@dhis2/d2-i18n";

const GeneralInfoStep = props => {
    const { syncRule, onChange } = props;

    const updateFields = (field, value) => {
        if (field === "name") {
            onChange(syncRule.updateName(value));
        } else if (field === "code") {
            onChange(syncRule.updateCode(value));
        } else if (field === "description") {
            onChange(syncRule.updateDescription(value));
        }
    };

    const fields = [
        {
            name: "name",
            value: syncRule.name,
            component: TextField,
            props: {
                floatingLabelText: `${i18n.t("Name")} (*)`,
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
            name: "code",
            value: syncRule.code,
            component: TextField,
            props: {
                floatingLabelText: `${i18n.t("Code")}`,
                style: { width: "100%" },
                changeEvent: "onBlur",
                "data-test": "code",
            },
            validators: [],
        },
        {
            name: "description",
            value: syncRule.description,
            component: TextField,
            props: {
                floatingLabelText: i18n.t("Description"),
                style: { width: "100%" },
                changeEvent: "onBlur",
                "data-test": "description",
            },
            validators: [],
        },
    ];

    return <FormBuilder fields={fields} onUpdateField={updateFields} />;
};

GeneralInfoStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

GeneralInfoStep.defaultProps = {};

export default GeneralInfoStep;
