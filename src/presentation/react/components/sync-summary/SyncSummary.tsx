import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    DialogContent,
    makeStyles,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { ConfirmationDialog } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { PublicInstance } from "../../../../domain/instance/entities/Instance";
import { Store } from "../../../../domain/packages/entities/Store";
import {
    ErrorMessage,
    SynchronizationResult,
    SynchronizationStats,
} from "../../../../domain/synchronization/entities/SynchronizationResult";
import { SynchronizationType } from "../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../locales";
import SyncReport from "../../../../models/syncReport";
import { useAppContext } from "../../contexts/AppContext";

const useStyles = makeStyles(theme => ({
    accordionHeading1: {
        marginLeft: 30,
        fontSize: theme.typography.pxToRem(15),
        flexBasis: "55%",
        flexShrink: 0,
    },
    accordionHeading2: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    accordionDetails: {
        padding: "4px 24px 4px",
    },
    accordion: {
        paddingBottom: "10px",
    },
    tooltip: {
        maxWidth: 650,
        fontSize: "0.9em",
    },
}));

export const formatStatusTag = (value: string) => {
    const text = _.startCase(_.toLower(value));
    const color =
        value === "ERROR" || value === "FAILURE" || value === "NETWORK ERROR"
            ? "#e53935"
            : value === "DONE" || value === "SUCCESS" || value === "OK"
            ? "#7cb342"
            : "#3e2723";

    return <b style={{ color }}>{text}</b>;
};

const buildSummaryTable = (stats: SynchronizationStats[]) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{i18n.t("Type")}</TableCell>
                    <TableCell>{i18n.t("Imported")}</TableCell>
                    <TableCell>{i18n.t("Updated")}</TableCell>
                    <TableCell>{i18n.t("Deleted")}</TableCell>
                    <TableCell>{i18n.t("Ignored")}</TableCell>
                    <TableCell>{i18n.t("Total")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {stats.map(({ type, imported, updated, deleted, ignored, total }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{imported}</TableCell>
                        <TableCell>{updated}</TableCell>
                        <TableCell>{deleted}</TableCell>
                        <TableCell>{ignored}</TableCell>
                        <TableCell>
                            {total || _.sum([imported, deleted, ignored, updated])}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const buildDataStatsTable = (type: SynchronizationType, stats: any[], classes: any) => {
    const elementName = type === "aggregated" ? i18n.t("Data element") : i18n.t("Program");

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{elementName}</TableCell>
                    <TableCell>{i18n.t("Number of entries")}</TableCell>
                    {type === "events" && <TableCell>{i18n.t("Org units")}</TableCell>}
                </TableRow>
            </TableHead>
            <TableBody>
                {stats.map(({ dataElement, program, count, orgUnits }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{dataElement || program}</TableCell>
                        <TableCell>{count}</TableCell>
                        {type === "events" && (
                            <Tooltip
                                classes={{ tooltip: classes.tooltip }}
                                open={orgUnits.length <= 3 ? false : undefined}
                                title={orgUnits.join(", ")}
                                placement="top"
                            >
                                <TableCell>{`${_.take(orgUnits, 3).join(", ")} ${
                                    orgUnits.length > 3 ? "and more" : ""
                                }`}</TableCell>
                            </Tooltip>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const buildMessageTable = (messages: ErrorMessage[]) => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{i18n.t("Identifier")}</TableCell>
                    <TableCell>{i18n.t("Type")}</TableCell>
                    <TableCell>{i18n.t("Property")}</TableCell>
                    <TableCell>{i18n.t("Message")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {messages.map(({ id, type, property, message }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{id}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{property}</TableCell>
                        <TableCell>{message}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const getTypeName = (reportType: SynchronizationType, syncType: string) => {
    switch (reportType) {
        case "aggregated":
            return syncType === "events" ? i18n.t("Program Indicators") : i18n.t("Aggregated");
        case "events":
            return i18n.t("Events");
        case "metadata":
            return i18n.t("Metadata");
        case "deleted":
            return i18n.t("Deleted");
        default:
            return i18n.t("Unknown");
    }
};

interface SyncSummaryProps {
    response: SyncReport;
    onClose: () => void;
}

const getOriginName = (source: PublicInstance | Store) => {
    if ((source as Store).token) {
        const store = source as Store;
        return store.account + " - " + store.repository;
    } else {
        const instance = source as PublicInstance;
        return instance.name;
    }
};

const SyncSummary = ({ response, onClose }: SyncSummaryProps) => {
    const { api } = useAppContext();
    const classes = useStyles();
    const [results, setResults] = useState<SynchronizationResult[]>([]);

    useEffect(() => {
        response.loadSyncResults(api).then(setResults);
    }, [api, response]);

    if (results.length === 0) return null;
    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Synchronization Results")}
            onCancel={onClose}
            cancelText={i18n.t("Ok")}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                {results.map(
                    (
                        {
                            origin,
                            instance,
                            status,
                            typeStats = [],
                            stats,
                            message,
                            errors,
                            type,
                            originPackage,
                        },
                        i
                    ) => (
                        <Accordion
                            defaultExpanded={results.length === 1}
                            className={classes.accordion}
                            key={`row-${i}`}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography className={classes.accordionHeading1}>
                                    {`Type: ${getTypeName(type, response.syncReport.type)}`}
                                    <br />
                                    {origin && `${i18n.t("Origin")}: ${getOriginName(origin)}`}
                                    {origin && <br />}
                                    {originPackage &&
                                        `${i18n.t("Origin package")}: ${originPackage.name}`}
                                    {originPackage && <br />}
                                    {`${i18n.t("Destination instance")}: ${instance.name}`}
                                </Typography>
                                <Typography className={classes.accordionHeading2}>
                                    {`${i18n.t("Status")}: `}
                                    {formatStatusTag(status)}
                                </Typography>
                            </AccordionSummary>

                            <AccordionDetails className={classes.accordionDetails}>
                                <Typography variant="overline">{i18n.t("Summary")}</Typography>
                            </AccordionDetails>

                            {message && (
                                <AccordionDetails className={classes.accordionDetails}>
                                    <Typography variant="body2">{message}</Typography>
                                </AccordionDetails>
                            )}

                            {stats && (
                                <AccordionDetails className={classes.accordionDetails}>
                                    {buildSummaryTable([
                                        ...typeStats,
                                        { ...stats, type: i18n.t("Total") },
                                    ])}
                                </AccordionDetails>
                            )}

                            {errors && errors.length > 0 && (
                                <div>
                                    <AccordionDetails className={classes.accordionDetails}>
                                        <Typography variant="overline">
                                            {i18n.t("Messages")}
                                        </Typography>
                                    </AccordionDetails>
                                    <AccordionDetails className={classes.accordionDetails}>
                                        {buildMessageTable(_.take(errors, 10))}
                                    </AccordionDetails>
                                </div>
                            )}
                        </Accordion>
                    )
                )}

                {response.syncReport.dataStats && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.accordionHeading1}>
                                {i18n.t("Data Statistics")}
                            </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            {buildDataStatsTable(
                                response.syncReport.type,
                                response.syncReport.dataStats,
                                classes
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.accordionHeading1}>
                            {i18n.t("JSON Response")}
                        </Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <ReactJson
                            src={{ ...response, results }}
                            collapsed={2}
                            enableClipboard={false}
                        />
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default SyncSummary;
