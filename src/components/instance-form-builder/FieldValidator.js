/* *
 * The result coming from FormBuilder validateField will contain an error message on fail and
 * a boolean true if it succeeds.
 */
const isInvalidField = validatedResult => validatedResult !== true;

const validateField = (field, formRef, formRefStateClone) => {
    const validateResult = formRef.validateField(formRefStateClone, field.name, field.value);
    return {
        invalid: isInvalidField(validateResult),
        name: field.name,
        message: validateResult,
    };
};

/**
 * Will first filter out all the fields that are invalid.
 * Then it will validate the fields using a reference to the formBuilder.
 * Lastly it will fetch the first field with a failing validator.
 */
const getAllInvalidFields = (fieldConfigs, formRef, formRefStateClone) =>
    fieldConfigs
        .map(fieldConfig => validateField(fieldConfig, formRef, formRefStateClone))
        .filter(field => field.invalid);

/**
 * Validate checks all the fields that are required or have an invalid value in the form.
 * The validation will set the fields as invalid in the formbuilder and set
 * the new state of the form.
 *
 * If any of the fields are invalid, it will create a message string
 * of the first invalid field.
 *
 * @returns {string}
 * The name and step/group of the invalid field.
 * If no invalid fields, it will return an empty string.
 */
export default function isFormValid(fieldConfigs, formRef) {
    const formRefStateClone = formRef.getStateClone();

    const invalidFields = getAllInvalidFields(fieldConfigs, formRef, formRefStateClone);

    if (invalidFields.length > 0) {
        formRef.state = formRefStateClone;
    }

    return invalidFields;
}
