import { makeStyles, Typography } from "@material-ui/core";
import { MultiSelector, useSnackbar, withSnackbar } from "@eyeseetea/d2-ui-components";
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
        changeInclude,
        ruleOptions,
        includeRules,
    } = useMetadataIncludeExcludeStep(syncRule, onChange);

    useEffect(() => {
        if (error) {
            snackbar.error(error);
        }
    }, [error, snackbar]);

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Use default dependencies")}
                value={syncRule.useDefaultIncludeExclude}
                onValueChange={changeUseDefaultIncludeExclude}
            />
            {!syncRule.useDefaultIncludeExclude && (
                <div className={classes.includeExcludeContainer}>
                    <Dropdown
                        key={"model-selection"}
                        items={modelSelectItems}
                        onValueChange={changeModelName}
                        value={selectedType}
                        label={i18n.t("Metadata type")}
                    />

                    {selectedType && (
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
                    )}
                </div>
            )}
        </React.Fragment>
    );
};

export default withSnackbar(MetadataIncludeExcludeStep);

const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;
