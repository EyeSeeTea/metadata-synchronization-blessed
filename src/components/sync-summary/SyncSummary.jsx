import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import { ConfirmationDialog } from "d2-ui-components";
import ReactJson from "react-json-view";

import { withStyles } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import DialogContent from "@material-ui/core/DialogContent";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
        response: PropTypes.array.isRequired,
        handleClose: PropTypes.func.isRequired,
    };

    handleClose = () => {
        this.props.handleClose();
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

    render() {
        const { isOpen, response, classes } = this.props;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={isOpen}
                    title={i18n.t("Synchronization Results")}
                    onSave={this.handleClose}
                    saveText={i18n.t("Ok")}
                    maxWidth={"lg"}
                    fullWidth={true}
                >
                    <DialogContent>
                        {response.map((responseElement, i) => (
                            <ExpansionPanel
                                defaultExpanded={response.length === 1}
                                className={classes.expansionPanel}
                                key={`row-${i}`}
                            >
                                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography className={classes.expansionPanelHeading1}>
                                        {`${responseElement.instance.name} (${
                                            responseElement.instance.url
                                        })`}
                                    </Typography>
                                    <Typography className={classes.expansionPanelHeading2}>
                                        {`Status: ${responseElement.status}`}
                                    </Typography>
                                </ExpansionPanelSummary>

                                <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                    <Typography variant={"overline"}>Summary</Typography>
                                </ExpansionPanelDetails>

                                <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                                    {SyncSummary.buildSummaryTable([
                                        ...responseElement.report.typeStats,
                                        { type: "Total", ...responseElement.stats },
                                    ])}
                                </ExpansionPanelDetails>

                                {responseElement.report.messages.length > 0 && (
                                    <div>
                                        <ExpansionPanelDetails
                                            className={classes.expansionPanelDetails}
                                        >
                                            <Typography variant={"overline"}>Messages</Typography>
                                        </ExpansionPanelDetails>
                                        <ExpansionPanelDetails
                                            className={classes.expansionPanelDetails}
                                        >
                                            {SyncSummary.buildMessageTable(
                                                responseElement.report.messages
                                            )}
                                        </ExpansionPanelDetails>
                                    </div>
                                )}
                            </ExpansionPanel>
                        ))}

                        <ExpansionPanel defaultExpanded={response.length === 0}>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography className={classes.expansionPanelHeading1}>
                                    JSON Response
                                </Typography>
                            </ExpansionPanelSummary>

                            <ExpansionPanelDetails>
                                <ReactJson src={response} collapsed={2} enableClipboard={false} />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </DialogContent>
                </ConfirmationDialog>
            </React.Fragment>
        );
    }
}

export default withStyles(styles)(SyncSummary);
