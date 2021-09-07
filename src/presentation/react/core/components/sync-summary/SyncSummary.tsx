import { ConfirmationDialog, useLoading } from "@eyeseetea/d2-ui-components";
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
import _ from "lodash";
import { useEffect, useState } from "react";
import ReactJson from "react-json-view";
import { SynchronizationReport } from "../../../../../domain/reports/entities/SynchronizationReport";
import {
    ErrorMessage,
    SynchronizationResult,
    SynchronizationStats,
} from "../../../../../domain/reports/entities/SynchronizationResult";
import { Store } from "../../../../../domain/stores/entities/Store";
import {
    SynchronizationResultType,
    SynchronizationType,
} from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import { NamedRef } from "../../../../../domain/common/entities/Ref";

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
                        <TableCell>{total || _.sum([imported, deleted, ignored, updated])}</TableCell>
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

const getTypeName = (reportType: SynchronizationResultType, syncType: string) => {
    switch (reportType) {
        case "aggregated":
            return syncType === "events" ? i18n.t("Program Indicators") : i18n.t("Aggregated");
        case "events":
            return i18n.t("Events");
        case "trackedEntityInstances":
            return i18n.t("Tracked Entity Instances");
        case "metadata":
            return i18n.t("Metadata");
        case "deleted":
            return i18n.t("Deleted");
        default:
            return i18n.t("Unknown");
    }
};

interface SyncSummaryProps {
    report: SynchronizationReport;
    onClose: () => void;
}

const getOriginName = (source: NamedRef | Store) => {
    if ((source as Store).token) {
        const store = source as Store;
        return store.account + " - " + store.repository;
    } else {
        const instance = source as NamedRef;
        return instance.name;
    }
};

const SyncSummary = ({ report, onClose }: SyncSummaryProps) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const loading = useLoading();

    const [results, setResults] = useState<SynchronizationResult[]>(report.getResults());
    const payloads = _.compact(report.getResults().map(({ payload }) => payload));

    const downloadJSON = async () => {
        loading.show(true, i18n.t("Generating JSON"));
        await compositionRoot.reports.downloadPayloads([report]);
        loading.reset();
    };

    useEffect(() => {
        if (report.getResults().length > 0) return;
        compositionRoot.reports.getSyncResults(report.id).then(setResults);
    }, [compositionRoot, report]);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Synchronization Results")}
            onCancel={onClose}
            onInfoAction={payloads.length > 0 ? downloadJSON : undefined}
            cancelText={i18n.t("Ok")}
            maxWidth={"lg"}
            fullWidth={true}
            infoActionText={i18n.t("Download JSON Payload")}
        >
            <DialogContent>
                {results.map(
                    ({ origin, instance, status, typeStats = [], stats, message, errors, type, originPackage }, i) => (
                        <Accordion
                            defaultExpanded={results.length === 1}
                            className={classes.accordion}
                            key={`row-${i}`}
                        >
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography className={classes.accordionHeading1}>
                                    {`Type: ${getTypeName(type, report.type)}`}
                                    <br />
                                    {origin && `${i18n.t("Origin")}: ${getOriginName(origin)}`}
                                    {origin && <br />}
                                    {originPackage && `${i18n.t("Origin package")}: ${originPackage.name}`}
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
                                    {buildSummaryTable([...typeStats, { ...stats, type: i18n.t("Total") }])}
                                </AccordionDetails>
                            )}

                            {errors && errors.length > 0 && (
                                <div>
                                    <AccordionDetails className={classes.accordionDetails}>
                                        <Typography variant="overline">{i18n.t("Messages")}</Typography>
                                    </AccordionDetails>
                                    <AccordionDetails className={classes.accordionDetails}>
                                        {buildMessageTable(_.take(errors, 10))}
                                    </AccordionDetails>
                                </div>
                            )}
                        </Accordion>
                    )
                )}

                {report.dataStats && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography className={classes.accordionHeading1}>{i18n.t("Data Statistics")}</Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                            {buildDataStatsTable(report.type, report.dataStats, classes)}
                        </AccordionDetails>
                    </Accordion>
                )}

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography className={classes.accordionHeading1}>{i18n.t("JSON Response")}</Typography>
                    </AccordionSummary>

                    <AccordionDetails>
                        <ReactJson src={{ ...report, results }} collapsed={2} enableClipboard={false} />
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default SyncSummary;
