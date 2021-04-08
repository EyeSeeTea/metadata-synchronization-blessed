import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    makeStyles,
    Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import _ from "lodash";
import React from "react";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../locales";
import { SummaryStepContent } from "../sync-wizard/common/SummaryStep";

export const SyncRuleImportSummary = (props: SyncRuleImportSummaryProps) => {
    const { validRules, invalidRuleCount, errors } = props;
    const classes = useStyles();

    return (
        <React.Fragment>
            <p className={classes.overview}>
                {_.compact([
                    invalidRuleCount > 0
                        ? i18n.t("You have uploaded {{n}} rules with a wrong type.")
                        : undefined,
                    validRules.length > 0
                        ? i18n.t("You're about to import the following synchronization rules:")
                        : i18n.t("All the uploaded rules are invalid and cannot be imported."),
                ]).join("\n")}
            </p>

            {validRules.map((rule, idx) => {
                const name = i18n.t("Sync rule {{idx}}: {{name}} ({{id}})", {
                    idx: idx + 1,
                    name: rule.name,
                    id: rule.id,
                    nsSeparator: false,
                });
                return (
                    <Accordion key={`row-${idx + 1}`}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.heading}>{name}</Typography>
                        </AccordionSummary>

                        <AccordionDetails className={classes.details}>
                            <SummaryStepContent syncRule={rule} name={name} />
                        </AccordionDetails>
                    </Accordion>
                );
            })}

            {errors.length > 0 ? (
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.heading}>{i18n.t("Errors")}</Typography>
                    </AccordionSummary>

                    {errors.map((error, idx) => (
                        <AccordionDetails key={`error-${idx}`} className={classes.details}>
                            {error}
                        </AccordionDetails>
                    ))}
                </Accordion>
            ) : null}
        </React.Fragment>
    );
};

export interface SyncRuleImportSummaryProps {
    validRules: SynchronizationRule[];
    invalidRuleCount: number;
    errors: string[];
}

const useStyles = makeStyles(theme => ({
    overview: {
        marginBottom: "25px",
    },
    heading: {
        marginLeft: 20,
        fontSize: theme.typography.pxToRem(16),
        flexBasis: "55%",
        flexShrink: 0,
    },
    details: {
        padding: "8px 24px 8px",
    },
}));
