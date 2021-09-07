import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React from "react";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import i18n from "../../../../../locales";
import { SummaryStepContent } from "../sync-wizard/common/SummaryStep";

export const SyncRuleImportSummary = (props: SyncRuleImportSummaryProps) => {
    const { rules, errors } = props;
    const classes = useStyles();

    return (
        <React.Fragment>
            <p className={classes.overview}>
                {errors.length === 0 && rules.length > 0
                    ? i18n.t("You're about to import the following synchronization rules:")
                    : i18n.t("We found some errors while trying to upload the following sync rules:")}
            </p>

            {rules.map((rule, idx) => {
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
                    <AccordionDetails className={classes.details}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{i18n.t("Identifier")}</TableCell>
                                    <TableCell>{i18n.t("Error")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {errors.map((error, idx) => {
                                    const [file, ...errors] = error.split(":");
                                    return (
                                        <TableRow key={`row-${idx}`}>
                                            <TableCell>{file}</TableCell>
                                            <TableCell>{errors.join(":")}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            ) : null}
        </React.Fragment>
    );
};

export interface SyncRuleImportSummaryProps {
    rules: SynchronizationRule[];
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
