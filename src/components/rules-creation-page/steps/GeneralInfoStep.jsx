import React from "react";
import PropTypes from "prop-types";
import { FormBuilder, Validators } from "@dhis2/d2-ui-forms";
import { TextField } from "@dhis2/d2-ui-core";
import i18n from "@dhis2/d2-i18n";

const GeneralInfoStep = props => {
    const { syncRule } = props;

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

    const updateFields = (field, value) => {
        props.syncRule[field] = value;
    };

    return <FormBuilder fields={fields} onUpdateField={updateFields} />;
};

GeneralInfoStep.propTypes = {
    syncRule: PropTypes.object.isRequired,
};

GeneralInfoStep.defaultProps = {};

export default GeneralInfoStep;
