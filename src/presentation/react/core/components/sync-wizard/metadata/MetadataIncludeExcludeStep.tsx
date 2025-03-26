import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
import { MultiSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import React, { useEffect } from "react";
import i18n from "../../../../../../locales";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";
import { styled } from "styled-components";
import { useMetadataIncludeExcludeStep } from "./useMetadataIncludeExcludeStep";

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
        syncParams,
        useDefaultIncludeExclude,
        changeInclude,
        ruleOptions,
        includeRules,
        changeIncludeReferencesAndObjectsRules,
        includeRuleOptions,
        includeReferencesAndObjectsRules,
        changeSharingSettings,
        changeOrgUnitReferences,
        changeRemoveOrgUnitObjects,
        changeRemoveUserObjects,
        changeRemoveUserObjectsAndReferences,
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
                <div>
                    <Toggle
                        label={i18n.t("Include owner and sharing settings")}
                        onValueChange={changeSharingSettings}
                        value={syncParams.includeSharingSettings}
                    />
                </div>

                <div>
                    <Toggle
                        label={i18n.t("Remove organisation units and references (UID)")}
                        onValueChange={changeOrgUnitReferences}
                        value={syncParams.removeOrgUnitReferences}
                    />
                </div>

                <div>
                    <Toggle
                        disabled={syncParams.removeOrgUnitReferences}
                        label={i18n.t("Remove organisation units and keep organisation units references (UID)")}
                        onValueChange={changeRemoveOrgUnitObjects}
                        value={syncParams.removeOrgUnitObjects || false}
                    />
                </div>

                <div>
                    <Toggle
                        label={i18n.t("Remove users and references (UID)")}
                        onValueChange={changeRemoveUserObjectsAndReferences}
                        value={syncParams.removeUserObjectsAndReferences || false}
                    />
                </div>

                <div>
                    <Toggle
                        label={i18n.t("Remove users and keep user references (UID)")}
                        onValueChange={changeRemoveUserObjects}
                        value={syncParams.removeUserObjects || false}
                    />
                </div>
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
