import { Divider, TextField } from "@material-ui/core";
import React from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../locales";
import { authTypeItems } from "../../../../webapp/core/pages/instance-creation/GeneralInfoForm";
import Dropdown from "../dropdown/Dropdown";
import { useAdexInstanceCredentials } from "./useAdexInstanceCredentials";
import styled from "styled-components";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";

export interface AdexInstanceCredentialsDialogProps {
    syncRule: SynchronizationRule;
    onChange: (syncRule: SynchronizationRule) => void;
    onDismiss?: () => void;
}

const AdexInstanceCredentialsDialog: React.FC<AdexInstanceCredentialsDialogProps> = ({
    syncRule,
    onChange,
    onDismiss,
}) => {
    const { instances, adexInstanceCandidates, onChangeField, onSave, errors } = useAdexInstanceCredentials(
        syncRule,
        onChange,
        onDismiss
    );

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Aggregated Data Exchange instances credentials")}
            saveText={i18n.t("Ok")}
            cancelText={i18n.t("Cancel")}
            onSave={onSave}
            onCancel={onDismiss}
        >
            {adexInstanceCandidates.map((adexProps, index) => {
                const instance = instances.find((instance: Instance) => instance.id === adexProps.target.instanceId);

                const instanceTitle = i18n.t("Instance: {{name}}", {
                    name: instance?.name ?? "",
                    nsSeparator: false,
                });

                if (adexProps.target.type === "internal") {
                    return (
                        <div key={index}>
                            <h4>{instanceTitle}</h4>
                            <p>{i18n.t("Internal exchange — no credentials required.")}</p>
                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                        </div>
                    );
                }

                return (
                    <div key={index}>
                        <h4>{instanceTitle}</h4>

                        <DropdownContainer>
                            <Dropdown
                                items={authTypeItems}
                                label={i18n.t("Authentication Scheme (*)")}
                                value={adexProps.target.authType ?? "http-basic"}
                                onValueChange={(value: string) =>
                                    onChangeField(adexProps.target.instanceId, "authType", value)
                                }
                                hideEmpty={true}
                            />
                        </DropdownContainer>

                        {adexProps.target.authType === "api-token" && (
                            <StyledTextField
                                key={`${adexProps.target.instanceId}-token`}
                                fullWidth={true}
                                label={i18n.t("Token (*)")}
                                value={adexProps.target.token ?? ""}
                                onChange={e => onChangeField(adexProps.target.instanceId, "token", e.target.value)}
                                error={errors[adexProps.target.instanceId ?? ""]?.some(err => err.property === "token")}
                                helperText={
                                    errors[adexProps.target.instanceId ?? ""]?.find(err => err.property === "token")
                                        ?.description
                                }
                            />
                        )}

                        {adexProps.target.authType === "http-basic" && (
                            <>
                                <StyledTextField
                                    key={`${adexProps.target.instanceId}-username`}
                                    fullWidth={true}
                                    label={i18n.t("Username (*)")}
                                    value={adexProps.target.username ?? ""}
                                    onChange={e =>
                                        onChangeField(adexProps.target.instanceId, "username", e.target.value)
                                    }
                                    error={errors[adexProps.target.instanceId ?? ""]?.some(
                                        err => err.property === "username"
                                    )}
                                    helperText={
                                        errors[adexProps.target.instanceId ?? ""]?.find(
                                            err => err.property === "username"
                                        )?.description
                                    }
                                />
                                <StyledTextField
                                    type="password"
                                    fullWidth={true}
                                    label={i18n.t("Password (*)")}
                                    value={adexProps.target.password ?? ""}
                                    onChange={e =>
                                        onChangeField(adexProps.target.instanceId, "password", e.target.value)
                                    }
                                    error={errors[adexProps.target.instanceId ?? ""]?.some(
                                        err => err.property === "password"
                                    )}
                                    helperText={
                                        errors[adexProps.target.instanceId ?? ""]?.find(
                                            err => err.property === "password"
                                        )?.description
                                    }
                                />
                            </>
                        )}
                        <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                    </div>
                );
            })}
        </ConfirmationDialog>
    );
};

export default AdexInstanceCredentialsDialog;

const StyledTextField = styled(TextField)({
    marginBottom: 25,
});

const DropdownContainer = styled.div({
    marginTop: 15,
    marginLeft: -10,
    marginBottom: 10,
});
