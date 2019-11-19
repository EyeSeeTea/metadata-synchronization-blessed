import React from "react";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import { ConfirmationDialog } from "d2-ui-components";
import ReactJson from "react-json-view";

import {
    DialogContent,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    withStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SyncReport from "../../models/syncReport";

const styles = theme => ({
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
});

class SyncSummary extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        response: PropTypes.instanceOf(SyncReport).isRequired,
        handleClose: PropTypes.func.isRequired,
    };

    state = {
        results: [],
    };

    static buildSummaryTable(stats) {
        return (
            <Table padding={"dense"}>
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
                    {stats.map(({ type, created, deleted, ignored, updated, total }, i) => (
                        <TableRow key={`row-${i}`}>
                            <TableCell>{type}</TableCell>
                            <TableCell>{created}</TableCell>
                            <TableCell>{deleted}</TableCell>
                            <TableCell>{ignored}</TableCell>
                            <TableCell>{updated}</TableCell>
                            <TableCell>{total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }

    static buildMessageTable(messages) {
        return (
            <Table padding={"dense"}>
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
    }

    componentDidUpdate = async prevProps => {
        const { response, d2 } = this.props;
        if (response !== prevProps.response) {
            await response.loadSyncResults(d2);
            this.setState({ results: response.results });
        }
    };

    render() {
        const { isOpen, response, classes, handleClose } = this.props;
        const { results } = this.state;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={isOpen}
                    title={i18n.t("Synchronization Results")}
                    onSave={handleClose}
                    saveText={i18n.t("Ok")}
                    maxWidth={"lg"}
                    fullWidth={true}
                >
                    <DialogContent>
                        {results &&
                            results.map((responseElement, i) => (
                                <ExpansionPanel
                                    defaultExpanded={results.length === 1}
                                    className={classes.expansionPanel}
                                    key={`row-${i}`}
                                >
                                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography className={classes.expansionPanelHeading1}>
                                            {`${responseElement.instance.name} (${responseElement.instance.url})`}
                                        </Typography>
                                        <Typography className={classes.expansionPanelHeading2}>
                                            {`${i18n.t("Status")}: ${responseElement.status}`}
                                        </Typography>
                                    </ExpansionPanelSummary>

                                    <ExpansionPanelDetails
                                        className={classes.expansionPanelDetails}
                                    >
                                        <Typography variant="overline">
                                            {i18n.t("Summary")}
                                        </Typography>
                                    </ExpansionPanelDetails>

                                    {responseElement.message && (
                                        <ExpansionPanelDetails
                                            className={classes.expansionPanelDetails}
                                        >
                                            <Typography variant="body2">
                                                {responseElement.message}
                                            </Typography>
                                        </ExpansionPanelDetails>
                                    )}

                                    <ExpansionPanelDetails
                                        className={classes.expansionPanelDetails}
                                    >
                                        {responseElement.report &&
                                            SyncSummary.buildSummaryTable([
                                                ...responseElement.report.typeStats,
                                                { type: i18n.t("Total"), ...responseElement.stats },
                                            ])}
                                    </ExpansionPanelDetails>

                                    {responseElement.report &&
                                        responseElement.report.messages.length > 0 && (
                                            <div>
                                                <ExpansionPanelDetails
                                                    className={classes.expansionPanelDetails}
                                                >
                                                    <Typography variant="overline">
                                                        {i18n.t("Messages")}
                                                    </Typography>
                                                </ExpansionPanelDetails>
                                                <ExpansionPanelDetails
                                                    className={classes.expansionPanelDetails}
                                                >
                                                    {SyncSummary.buildMessageTable(
                                                        _.take(responseElement.report.messages, 10)
                                                    )}
                                                </ExpansionPanelDetails>
                                            </div>
                                        )}
                                </ExpansionPanel>
                            ))}

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
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(SyncSummary);
