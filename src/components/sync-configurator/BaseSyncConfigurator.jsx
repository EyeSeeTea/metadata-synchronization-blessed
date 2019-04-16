import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { DatePicker, ObjectsTable, withSnackbar } from "d2-ui-components";
import Fab from "@material-ui/core/Fab";
import { withStyles } from "@material-ui/core/styles";
import SyncIcon from "@material-ui/icons/Sync";
import _ from "lodash";

import PageHeader from "../shared/PageHeader";
import SyncDialog from "../sync-dialog/SyncDialog";
import SyncSummary from "../sync-summary/SyncSummary";
import Dropdown from "../shared/Dropdown";
import { d2ModelFactory } from "../../models/d2ModelFactory";

const styles = theme => ({
    fab: {
        margin: theme.spacing.unit,
        position: "fixed",
        bottom: theme.spacing.unit * 5,
        right: theme.spacing.unit * 9,
    },
    tableContainer: { marginTop: -10 },
});

class BaseSyncConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        filters: {
            lastUpdatedDate: null,
            groupFilter: null,
            groupFilterData: [],
            levelFilter: null,
            levelFilterData: [],
        },
        metadata: {},
        importResponse: [],
        syncDialogOpen: false,
        syncSummaryOpen: false,
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        model: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        snackbar: PropTypes.object.isRequired,
        renderExtraFilters: PropTypes.func,
        extraFiltersState: PropTypes.object,
        groupFilterName: PropTypes.string,
        levelFilterName: PropTypes.string,
    };

    static defaultProps = {
        renderExtraFilters: null,
        extraFiltersState: null,
        groupFilterName: null,
        levelFilterName: null,
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    componentDidMount = async () => {
        const { groupFilterName, levelFilterName } = this.props;
        const { filters } = this.state;

        const groupFilterData = groupFilterName ? await this.getGroupFilterData() : null;
        const levelFilterData = levelFilterName ? await this.getLevelFilterData() : null;

        this.setState({ filters: { ...filters, groupFilterData, levelFilterData } });
    };

    componentDidUpdate = prevProps => {
        const { extraFiltersState } = this.props;
        if (extraFiltersState !== prevProps.extraFiltersState) {
            this.setState({ filters: { ...this.state.filters, ...extraFiltersState } });
        }
    };

    onBackHome = () => {
        this.props.history.push("/");
    };

    onSelectionChange = metadataSelection => {
        const metadata = {
            [this.props.model.getMetadataType()]: metadataSelection,
        };

        this.setState({ metadata });
    };

    onDateChange = value => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, lastUpdatedDate: value } });
    };

    onGroupChange = event => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, groupFilter: event.target.value } });
    };

    onLevelChange = event => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, levelFilter: event.target.value } });
    };

    onDialogClose = importResponse => {
        if (importResponse) {
            this.setState({ syncDialogOpen: false, syncSummaryOpen: true, importResponse });
        } else {
            this.props.snackbar.error(i18n.t("Unknown error with the request"));
            this.setState({ syncDialogOpen: false });
        }
    };

    onSummaryClose = () => {
        this.setState({ syncSummaryOpen: false });
    };

    onSynchronize = () => {
        const disabled = _(this.state.metadata)
            .values()
            .some(_.isEmpty);
        if (disabled) {
            this.props.snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        } else {
            this.setState({ syncDialogOpen: true });
        }
    };

    getGroupFilterData = async () => {
        const { d2, groupFilterName } = this.props;

        const groupClass = d2ModelFactory(d2, groupFilterName);
        const groupList = await groupClass.listMethod(
            d2,
            { customFields: ["id", "name"] },
            { paging: false }
        );

        return groupList.objects;
    };

    getLevelFilterData = async () => {
        const { d2, levelFilterName } = this.props;

        const levelClass = d2ModelFactory(d2, levelFilterName);
        const levelList = await levelClass.listMethod(
            d2,
            { customFields: ["level", "name"] },
            { paging: false, sorting: ["level", "asc"] }
        );

        return levelList.objects.map(e => ({
            id: e.level,
            name: `${e.level}. ${e.name}`,
        }));
    };

    renderCustomFilters = () => {
        const { d2, renderExtraFilters, model, groupFilterName, levelFilterName } = this.props;
        const {
            lastUpdatedDate,
            groupFilter,
            groupFilterData,
            levelFilter,
            levelFilterData,
        } = this.state.filters;
        const modelName = model.getD2Model(d2).displayName;

        return (
            <React.Fragment>
                <DatePicker
                    placeholder={i18n.t("Last updated date")}
                    value={lastUpdatedDate}
                    onChange={this.onDateChange}
                    isFilter
                />

                {groupFilterName && (
                    <Dropdown
                        key={"group-filter"}
                        items={groupFilterData}
                        onChange={this.onGroupChange}
                        value={groupFilter ? groupFilter : ""}
                        label={i18n.t("{{type}} Group", { type: modelName })}
                    />
                )}

                {levelFilterName && (
                    <Dropdown
                        key={"level-filter"}
                        items={levelFilterData}
                        onChange={this.onLevelChange}
                        value={levelFilter ? levelFilter : ""}
                        label={i18n.t("{{type}} Level", { type: modelName })}
                    />
                )}

                {renderExtraFilters && renderExtraFilters()}
            </React.Fragment>
        );
    };

    render() {
        const { d2, model, title, classes } = this.props;
        const {
            tableKey,
            syncDialogOpen,
            syncSummaryOpen,
            metadata,
            filters,
            importResponse,
        } = this.state;

        // Wrapper method to preserve static context
        const list = (...params) => model.listMethod(...params);

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.onBackHome} title={title} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={tableKey}
                        d2={d2}
                        model={model.getD2Model(d2)}
                        columns={model.getColumns()}
                        detailsFields={model.getDetails()}
                        pageSize={20}
                        initialSorting={model.getInitialSorting()}
                        actions={this.actions}
                        list={list}
                        customFiltersComponent={this.renderCustomFilters}
                        customFilters={filters}
                        onSelectionChange={this.onSelectionChange}
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
                <SyncDialog
                    d2={d2}
                    metadata={metadata}
                    isOpen={syncDialogOpen}
                    handleClose={this.onDialogClose}
                    encryptionKey={this.props.appConfig.encryptionKey}
                />
                <SyncSummary
                    response={importResponse}
                    isOpen={syncSummaryOpen}
                    handleClose={this.onSummaryClose}
                />
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(BaseSyncConfigurator)));
