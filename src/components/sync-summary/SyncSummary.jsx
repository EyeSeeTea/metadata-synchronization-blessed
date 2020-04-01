import i18n from "@dhis2/d2-i18n";
import {
    DialogContent,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
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
import { useD2Api } from "d2-api";
import { ConfirmationDialog } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import ReactJson from "react-json-view";

const useStyles = makeStyles(theme => ({
    expansionPanelHeading1: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: "55%",
        flexShrink: 0,
    },
    expansionPanelHeading2: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    expansionPanelDetails: {
        padding: "4px 24px 4px",
    },
    expansionPanel: {
        paddingBottom: "10px",
    },
    tooltip: {
        maxWidth: 650,
        fontSize: "0.9em",
    },
}));

export const formatStatusTag = value => {
    const text = _.startCase(_.toLower(value));
    const color =
        value === "ERROR" || value === "FAILURE" || value === "NETWORK ERROR"
            ? "#e53935"
            : value === "DONE" || value === "SUCCESS" || value === "OK"
            ? "#7cb342"
            : "#3e2723";

    return <b style={{ color }}>{text}</b>;
};

const buildSummaryTable = stats => {
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{i18n.t("Type")}</TableCell>
                    <TableCell>{i18n.t("Created")}</TableCell>
                    <TableCell>{i18n.t("Deleted")}</TableCell>
                    <TableCell>{i18n.t("Ignored")}</TableCell>
                    <TableCell>{i18n.t("Updated")}</TableCell>
                    <TableCell>{i18n.t("Total")}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {stats.map(({ type, imported, created, deleted, ignored, updated, total }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{created ?? imported ?? 0}</TableCell>
                        <TableCell>{deleted}</TableCell>
                        <TableCell>{ignored}</TableCell>
                        <TableCell>{updated}</TableCell>
                        <TableCell>
                            {total || _.sum([created, imported, deleted, ignored, updated])}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const buildDataStatsTable = (type, stats, classes) => {
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

const buildMessageTable = messages => {
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
                {messages.map(({ uid, type, property, message }, i) => (
                    <TableRow key={`row-${i}`}>
                        <TableCell>{uid}</TableCell>
                        <TableCell>{type}</TableCell>
                        <TableCell>{property}</TableCell>
                        <TableCell>{message}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const getTypeName = (reportType, syncType) => {
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

const SyncSummary = ({ response, onClose }) => {
    const api = useD2Api();
    const classes = useStyles();
    const [results, setResults] = useState([]);

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
                {results.map(({ instance, status, report, stats, message, type }, i) => (
                    <ExpansionPanel
                        defaultExpanded={results.length === 1}
                        className={classes.expansionPanel}
                        key={`row-${i}`}
                    >
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.expansionPanelHeading1}>
                                {`${i18n.t("Destination instance")}: ${
                                    instance.name
                                } - ${getTypeName(type, response.syncReport.type)}`}
                            </Typography>
                            <Typography className={classes.expansionPanelHeading2}>
                                {`${i18n.t("Status")}: `}
                                {formatStatusTag(status)}
                            </Typography>
                        </ExpansionPanelSummary>

                        <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                            <Typography variant="overline">{i18n.t("Summary")}</Typography>
                        </ExpansionPanelDetails>

                        {message && (
                            <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                <Typography variant="body2">{message}</Typography>
                            </ExpansionPanelDetails>
                        )}

                        {report && (
                            <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                {buildSummaryTable([
                                    ...(report.typeStats || []),
                                    { type: i18n.t("Total"), ...stats },
                                ])}
                            </ExpansionPanelDetails>
                        )}

                        {report && report.messages.length > 0 && (
                            <div>
                                <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                    <Typography variant="overline">{i18n.t("Messages")}</Typography>
                                </ExpansionPanelDetails>
                                <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                    {buildMessageTable(_.take(report.messages, 10))}
                                </ExpansionPanelDetails>
                            </div>
                        )}
                    </ExpansionPanel>
                ))}

                {response.syncReport.dataStats && (
                    <ExpansionPanel>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.expansionPanelHeading1}>
                                {i18n.t("Data Statistics")}
                            </Typography>
                        </ExpansionPanelSummary>

                        <ExpansionPanelDetails>
                            {buildDataStatsTable(
                                response.syncReport.type,
                                response.syncReport.dataStats,
                                classes
                            )}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                )}

                <ExpansionPanel>
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.expansionPanelHeading1}>
                            {i18n.t("JSON Response")}
                        </Typography>
                    </ExpansionPanelSummary>

                    <ExpansionPanelDetails>
                        <ReactJson
                            src={{ ...response, results }}
                            collapsed={2}
                            enableClipboard={false}
                        />
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default SyncSummary;
