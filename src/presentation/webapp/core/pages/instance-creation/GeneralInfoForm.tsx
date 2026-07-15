import { Button, Card, CardContent, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import _, { Dictionary } from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ValidationError } from "../../../../../domain/common/entities/Validations";
import { ExchangeTargetType, exchangeTargetTypes, Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../utils/i18n";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { useLocalInstance } from "../../../../react/core/hooks/useLocalInstance";
import SaveButton from "./SaveButton";
import { Dropdown } from "../../../../react/core/components/dropdown/Dropdown";

export interface GeneralInfoFormProps {
    instance: Instance;
    onChange: (instance: Instance) => void;
    cancelAction: () => void;
    onSaved?: (instance: Instance) => void;
    showMetadataMapping?: boolean;
    testConnectionVisible: boolean;
    isEdit?: boolean;
}

export const authTypeItems = [
    { id: "http-basic", name: i18n.t("Basic") },
    { id: "api-token", name: i18n.t("API Token") },
];

const typeItems = [
    { id: "dhis", name: i18n.t("Default") },
    { id: "aggregated-data-exchange", name: i18n.t("Aggregated Data Exchange") },
];

const exchangeTargetTypeLabels: Record<ExchangeTargetType, string> = {
    external: i18n.t("External"),
    internal: i18n.t("Internal"),
};

const exchangeTargetTypeItems = exchangeTargetTypes.map(id => ({ id, name: exchangeTargetTypeLabels[id] }));

const GeneralInfoForm = ({
    instance,
    onChange,
    cancelAction,
    testConnectionVisible,
    onSaved,
    showMetadataMapping,
    isEdit,
}: GeneralInfoFormProps) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const history = useHistory();
    const snackbar = useSnackbar();

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [didPasswordChange, setPasswordChange] = useState<boolean>(false);
    const [errors, setErrors] = useState<Dictionary<ValidationError>>({});

    const { localInstance } = useLocalInstance();
    const localInstanceUrl = localInstance?.url ?? "";

    useEffect(() => {
        if (instance.isInternalDataExchange && localInstanceUrl && instance.url !== localInstanceUrl) {
            onChange(instance.update({ url: localInstanceUrl }));
        }
    }, [instance, localInstanceUrl, onChange]);

    const updateModel = useCallback(
        (field: keyof Instance, value: string) => {
            const newInstance = instance.update({ [field]: value });
            const errors = _.keyBy(newInstance.validate([field]), "property");

            setErrors(errors);
            onChange(newInstance);
        },
        [instance, onChange]
    );

    const onChangeExchangeTargetType = useCallback(
        (value: string) => {
            const exchangeTargetType: ExchangeTargetType = value === "internal" ? "internal" : "external";
            const url = exchangeTargetType === "internal" ? localInstanceUrl : "";
            const newInstance = instance.update({ exchangeTargetType, url });

            setErrors(_.keyBy(newInstance.validate(["exchangeTargetType", "url"]), "property"));
            onChange(newInstance);
        },
        [instance, localInstanceUrl, onChange]
    );

    const onChangeField = useCallback(
        (field: keyof Instance) => {
            return (event: React.ChangeEvent<{ value: unknown }>) => {
                if (field === "password") setPasswordChange(true);
                updateModel(field, event.target.value as string);
            };
        },
        [updateModel]
    );

    const testConnection = useCallback(async () => {
        if (_.keys(errors).length > 0) {
            snackbar.error(i18n.t("Please fix the issues before testing the connection"));
            return;
        }

        const validation = await compositionRoot.instances.validate(instance);
        validation.match({
            success: () => {
                snackbar.success(i18n.t("Connected successfully to instance"));
            },
            error: error => {
                snackbar.error(error, { autoHideDuration: null });
            },
        });
    }, [compositionRoot, errors, instance, snackbar]);

    const goToMetadataMapping = useCallback(() => {
        history.push(`/instances/mapping/${instance.id}`);
    }, [history, instance]);

    const saveAction = useCallback(async () => {
        if (_.keys(errors).length > 0) {
            snackbar.error(i18n.t("Please fix the issues before testing the connection"));
            return;
        }

        setIsSaving(true);
        const validationErrors = await compositionRoot.instances.save(instance);
        setIsSaving(false);

        if (validationErrors.length === 0 && onSaved) {
            onSaved(instance);
        } else {
            snackbar.error(validationErrors.map(({ description }) => description).join("\n"));
        }
    }, [compositionRoot, errors, instance, snackbar, onSaved]);

    return (
        <Card>
            <CardContent className={classes.formContainer}>
                <TextField
                    className={classes.row}
                    fullWidth={true}
                    label={i18n.t("Server name (*)")}
                    value={instance.name ?? ""}
                    onChange={onChangeField("name")}
                    error={!!errors["name"]}
                    helperText={errors["name"]?.description}
                />
                <TextField
                    className={classes.row}
                    fullWidth={true}
                    label={i18n.t("Description")}
                    value={instance.description ?? ""}
                    onChange={onChangeField("description")}
                    error={!!errors["description"]}
                    helperText={errors["description"]?.description}
                />
                <div className={classes.dropdown}>
                    <Dropdown
                        items={typeItems}
                        label={i18n.t("Type")}
                        value={instance.type}
                        onValueChange={(value: string) => updateModel("type", value)}
                        hideEmpty={true}
                        disabled={isEdit}
                    />
                </div>

                {instance.type === "aggregated-data-exchange" && (
                    <div className={classes.dropdown}>
                        <Dropdown
                            items={exchangeTargetTypeItems}
                            label={i18n.t("Exchange target type (*)")}
                            value={instance.exchangeTargetType}
                            onValueChange={onChangeExchangeTargetType}
                            hideEmpty={true}
                            disabled={isEdit}
                        />
                    </div>
                )}

                {!instance.isInternalDataExchange && (
                    <TextField
                        className={classes.row}
                        fullWidth={true}
                        label={i18n.t("URL endpoint (*)")}
                        value={instance.url ?? ""}
                        onChange={onChangeField("url")}
                        error={!!errors["url"]}
                        helperText={errors["url"]?.description}
                    />
                )}

                {instance.type === "dhis" && (
                    <div className={classes.dropdown}>
                        <Dropdown
                            items={authTypeItems}
                            label={i18n.t("Authentication Scheme (*)")}
                            value={instance.authType ?? "http-basic"}
                            onValueChange={(value: string) => updateModel("authType", value)}
                            hideEmpty={true}
                        />
                    </div>
                )}

                {instance.type === "dhis" && instance.authType === "api-token" && (
                    <TextField
                        className={classes.row}
                        fullWidth={true}
                        label={i18n.t("Token (*)")}
                        value={instance.token ?? ""}
                        onChange={onChangeField("token")}
                        error={!!errors["token"]}
                        helperText={errors["token"]?.description}
                    />
                )}

                {instance.type === "dhis" && instance.authType === "http-basic" && (
                    <>
                        <TextField
                            className={classes.row}
                            fullWidth={true}
                            label={i18n.t("Username (*)")}
                            value={instance.username ?? ""}
                            onChange={onChangeField("username")}
                            error={!!errors["username"]}
                            helperText={errors["username"]?.description}
                        />
                        <TextField
                            className={classes.row}
                            type="password"
                            fullWidth={true}
                            label={i18n.t("Password (*)")}
                            value={didPasswordChange ? instance.password : ""}
                            onChange={onChangeField("password")}
                            error={!!errors["password"]}
                            helperText={errors["password"]?.description}
                        />
                    </>
                )}

                <div className={classes.buttonContainer}>
                    <div>
                        <SaveButton onClick={saveAction} isSaving={isSaving} data-test={"save-button"} />
                        <Button variant="contained" onClick={cancelAction} data-test={"cancel-button"}>
                            {i18n.t("Cancel")}
                        </Button>
                    </div>
                    <div className={classes.actionButtonsContainer}>
                        {instance.type === "dhis" && instance.id && showMetadataMapping && (
                            <Button
                                variant="contained"
                                onClick={goToMetadataMapping}
                                data-test={"metadata-mapping-button"}
                                className={classes.metadataMappingButton}
                            >
                                {i18n.t("Metadata mapping")}
                            </Button>
                        )}
                        {testConnectionVisible && instance.type === "dhis" && (
                            <Button variant="contained" onClick={testConnection} data-test={"test-connection-button"}>
                                {i18n.t("Test Connection")}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const useStyles = makeStyles(() => ({
    formContainer: {
        marginTop: 30,
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
    row: {
        marginBottom: 25,
    },
    dropdown: {
        marginTop: 15,
        marginLeft: -10,
        marginBottom: 20,
    },
}));

export default GeneralInfoForm;
