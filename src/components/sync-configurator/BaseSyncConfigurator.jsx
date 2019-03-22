import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable } from "d2-ui-components";
import Fab from "@material-ui/core/Fab";
import { withStyles } from "@material-ui/core/styles";
import SyncIcon from "@material-ui/icons/Sync";
import PageHeader from "../shared/PageHeader";
import { startSynchronization } from "../../logic/synchronization";
import Instance from "../../models/instance";

const styles = theme => ({
    fab: {
        margin: theme.spacing.unit,
        position: "fixed",
        bottom: theme.spacing.unit * 5,
        right: theme.spacing.unit * 5,
    },
    tableContainer: { marginTop: -10 },
});

class BaseSyncConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        selection: [],
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        model: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    selectionChange = selection => {
        this.setState({ selection });
    };

    onSynchronize = async () => {
        // TODO: Render new dialog to show summary and select destination instances

        // DEBUG: Use a hardcoded instance for now
        const instances = await Instance.list(
            this.props.d2,
            { search: "" },
            { page: 1, pageSize: 1, sorting: [] }
        );
        const instance = instances.objects[0];
        // END OF DEBUG SECTION

        const metadata = {
            [this.props.model.getMetadataType()]: this.state.selection,
        };

        // DEBUG: Force metadata sync with selected items to a hard-coded instance
        console.log("[DEBUG] Selected Metadata", metadata);
        const result = await startSynchronization(this.props.d2, {
            metadata,
            targetInstances: [instance],
        });
        console.log("[DEBUG] Synchronization Result", result);
        // END OF DEBUG SECTION
    };

    render() {
        const { d2, model, title, classes } = this.props;

        // Wrapper method to preserve static context
        const list = (...params) => model.listMethod(...params);

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.backHome} title={title} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={this.state.tableKey}
                        d2={d2}
                        model={model.getD2Model(d2)}
                        columns={model.getColumns()}
                        detailsFields={model.getDetails()}
                        pageSize={20}
                        initialSorting={model.getInitialSorting()}
                        actions={this.actions}
                        list={list}
                        onSelectionChange={this.selectionChange}
                    />
                    <Fab
                        color="primary"
                        aria-label="Add"
                        className={classes.fab}
                        size="large"
                        onClick={this.onSynchronize}
                        data-test="list-action-bar"
                    >
                        <SyncIcon />
                    </Fab>
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(withStyles(styles)(BaseSyncConfigurator));
