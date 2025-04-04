import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
import { MultiSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect } from "react";
import i18n from "../../../../../../utils/i18n";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import { styled } from "styled-components";
import { IncludeObjectsAndReferences, useMetadataIncludeExcludeStep } from "./useMetadataIncludeExcludeStep";

const useStyles = makeStyles({
    includeExcludeContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        marginTop: "20px",
    },
    multiselectorContainer: {
        width: "100%",
        paddingTop: "20px",
    },
});

const MetadataIncludeExcludeStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const {
        error,
        changeUseDefaultIncludeExclude,
        modelSelectItems,
        changeModelName,
        selectedType,
        d2,
        useDefaultIncludeExclude,
        changeInclude,
        ruleOptions,
        includeRules,
        changeIncludeReferencesAndObjectsRules,
        includeRuleOptions,
        includeReferencesAndObjectsRules,
        includeObjectsAndReferencesOptions,
        changeSharingSettingsObjectsAndReferences,
        changeUsersObjectsAndReferences,
        changeOrgUnitsObjectsAndReferences,
        sharingSettingsObjectsAndReferencesValue,
        usersObjectsAndReferencesValue,
        orgUnitsObjectsAndReferencesValue,
    } = useMetadataIncludeExcludeStep(syncRule, onChange);

    useEffect(() => {
        if (error) {
            snackbar.error(error);
        }
    }, [error, snackbar]);

    console.debug("Rendering MetadataIncludeExcludeStep");

    return modelSelectItems.length > 0 ? (
        <React.Fragment>
            <div>
                <DropdownContainer>
                    <Dropdown<IncludeObjectsAndReferences>
                        value={sharingSettingsObjectsAndReferencesValue}
                        items={includeObjectsAndReferencesOptions}
                        label={i18n.t("Include owner and sharing settings")}
                        style={{ width: "100%", marginTop: 20, marginBottom: 20, marginLeft: -10 }}
                        onValueChange={changeSharingSettingsObjectsAndReferences}
                        hideEmpty
                    />
                </DropdownContainer>

                <DropdownContainer>
                    <Dropdown<IncludeObjectsAndReferences>
                        value={usersObjectsAndReferencesValue}
                        items={includeObjectsAndReferencesOptions}
                        label={i18n.t("Include users")}
                        style={{ width: "100%", marginTop: 20, marginBottom: 20, marginLeft: -10 }}
                        onValueChange={changeUsersObjectsAndReferences}
                        hideEmpty
                    />
                </DropdownContainer>

                <DropdownContainer>
                    <Dropdown<IncludeObjectsAndReferences>
                        value={orgUnitsObjectsAndReferencesValue}
                        items={includeObjectsAndReferencesOptions}
                        label={i18n.t("Include organisation units")}
                        style={{ width: "100%", marginTop: 20, marginBottom: 20, marginLeft: -10 }}
                        onValueChange={changeOrgUnitsObjectsAndReferences}
                        hideEmpty
                    />
                </DropdownContainer>
            </div>
            <Toggle
                label={i18n.t("Use default dependencies")}
                value={useDefaultIncludeExclude}
                onValueChange={changeUseDefaultIncludeExclude}
            />
            {!useDefaultIncludeExclude && (
                <div className={classes.includeExcludeContainer}>
                    <Dropdown
                        key={"model-selection"}
                        items={modelSelectItems}
                        onValueChange={changeModelName}
                        value={selectedType}
                        label={i18n.t("Metadata type")}
                    />

                    {selectedType && (
                        <>
                            <div className={classes.multiselectorContainer}>
                                <Row>
                                    <Typography>{i18n.t("Exclude objects and references ->")}</Typography>
                                    <Typography>{i18n.t("Include objects")}</Typography>
                                </Row>
                                <MultiSelector
                                    d2={d2}
                                    height={300}
                                    onChange={changeInclude}
                                    options={ruleOptions}
                                    selected={includeRules}
                                />
                            </div>
                            <div className={classes.multiselectorContainer}>
                                <Row>
                                    <Typography>{i18n.t("Include only references ->")}</Typography>
                                    <Typography>{i18n.t("Include references and objects")}</Typography>
                                </Row>
                                <MultiSelector
                                    d2={d2}
                                    height={300}
                                    onChange={changeIncludeReferencesAndObjectsRules}
                                    options={includeRuleOptions}
                                    selected={includeReferencesAndObjectsRules}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </React.Fragment>
    ) : (
        <LoadingContainer>
            <CircularProgress />
        </LoadingContainer>
    );
};

export default React.memo(MetadataIncludeExcludeStep);

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
`;

const DropdownContainer = styled.div`
    width: fit-content;
    min-width: 350px;
`;
