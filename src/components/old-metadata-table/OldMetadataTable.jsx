import i18n from "@dhis2/d2-i18n";
import { Checkbox, FormControlLabel, withStyles } from "@material-ui/core";
import { ApiContext } from "d2-api";
import { DatePicker, OldObjectsTable, withSnackbar } from "d2-ui-components";
import _ from "lodash";
import memoize from "nano-memoize";
import PropTypes from "prop-types";
import React from "react";
import { getOrgUnitSubtree, listByIds } from "../../logic/utils";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import { d2BaseModelDetails } from "../../utils/d2";
import Dropdown from "../dropdown/Dropdown";

const styles = {
    checkbox: {
        paddingLeft: 30,
    },
};

class MetadataTable extends React.Component {
    static contextType = ApiContext;
    static propTypes = {
        d2: PropTypes.object.isRequired,
        classes: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
    };

    defaultModel = {
        getInitialSorting: () => [],
        getColumns: () => [
            { name: "displayName", text: i18n.t("Name"), sortable: true },
            {
                name: "metadataType",
                text: i18n.t("Metadata Type"),
                sortable: true,
                getValue: element => {
                    const model = this.props.d2.models[element.metadataType];
                    return model ? model.displayName : element.metadataType;
                },
            },
            { name: "lastUpdated", text: i18n.t("Last update"), sortable: true },
        ],
        getDetails: () => d2BaseModelDetails,
        getGroupFilterName: () => null,
        getLevelFilterName: () => null,
        getMetadataType: () => "",
        getD2Model: () => ({
            displayName: "Selected elements",
            modelValidations: {
                lastUpdated: { type: "DATE" },
            },
        }),
    };

    state = {
        model: this.defaultModel,
        filters: {
            lastUpdatedDate: null,
            groupFilter: null,
            levelFilter: null,
            metadataType: "",
        },
        groupFilterData: [],
        levelFilterData: [],
        metadataIds: [],
        orgUnitChildren: [],
        showOnlySelectedItems: false,
        tableKey: Math.random(),
    };

    selectChildren = async selectedOUs => {
        const { api } = this.context;

        const ids = new Set();
        for (const selectedOU of selectedOUs) {
            const subtree = await getOrgUnitSubtree(api, selectedOU.id);
            subtree.forEach(id => ids.add(id));
        }

        this.setState({ orgUnitChildren: Array.from(ids), tableKey: Math.random() });
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
        {
            name: "select-children",
            text: i18n.t("Select with children subtree"),
            multiple: true,
            onClick: this.selectChildren,
            icon: "done_all",
            isActive: () => {
                const { model } = this.state;
                return model.getMetadataType() === "organisationUnit";
            },
        },
    ];

    parseModels = memoize(models => {
        const { d2 } = this.props;
        return models
            .map(model => model.getD2Model(d2))
            .map(model => ({
                name: model.displayName,
                id: model.name,
            }));
    });

    updateFilterData = memoize(async model => {
        const { d2 } = this.props;
        const { api } = this.context;
        const newState = {};

        if (model && model.getGroupFilterName()) {
            const groupClass = d2ModelFactory(api, model.getGroupFilterName());
            const groupList = await groupClass.listMethod(
                d2,
                { customFields: ["id", "name"] },
                { paging: false }
            );
            newState.groupFilterData = groupList.objects;
        }

        if (model && model.getLevelFilterName()) {
            const orgUnitLevelsClass = d2ModelFactory(api, model.getLevelFilterName());
            const orgUnitLevelsList = await orgUnitLevelsClass.listMethod(
                d2,
                { customFields: ["level", "name"] },
                { paging: false, sorting: ["level", "asc"] }
            );
            newState.levelFilterData = orgUnitLevelsList.objects.map(e => ({
                id: e.level,
                name: `${e.level}. ${e.name}`,
            }));
        }

        return newState;
    });

    componentDidMount() {
        const {
            initialModel: model = this.defaultModel,
            initialSelection: metadataIds = [],
            isDelete = false,
        } = this.props;

        this.setState({
            model,
            metadataIds,
            showOnlySelectedItems: !isDelete && metadataIds.length > 0,
            tableKey: Math.random(),
        });
    }

    componentDidUpdate = async (prevProps, prevState) => {
        const { model, filters } = this.state;

        if (prevState.model !== model) {
            this.setState({
                ...(await this.updateFilterData(model)),
                filters: {
                    ...filters,
                    groupFilter: null,
                    levelFilter: null,
                },
            });
        }
    };

    changeModelName = event => {
        const { api } = this.context;
        const { filters } = this.state;

        this.setState({
            model: event.target.value ? d2ModelFactory(api, event.target.value) : this.defaultModel,
            filters: {
                ...filters,
                metadataType: event.target.value,
            },
        });
    };

    changeDateFilter = value => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, lastUpdatedDate: value } });
    };

    changeGroupFilter = event => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, groupFilter: event.target.value } });
    };

    changeLevelFilter = event => {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, levelFilter: event.target.value } });
    };

    showSelectedItems = event => {
        this.setState({ showOnlySelectedItems: event.target.checked, tableKey: Math.random() });
    };

    renderCustomFilters = () => {
        const { d2, classes, models, isDelete } = this.props;
        const {
            model,
            groupFilterData,
            levelFilterData,
            filters,
            showOnlySelectedItems,
        } = this.state;
        const { lastUpdatedDate, groupFilter, levelFilter } = filters;
        const displayName = model.getD2Model(d2).displayName;

        return (
            <React.Fragment>
                {(models.length > 1 || model === this.defaultModel) && (
                    <Dropdown
                        key={"model-filter"}
                        items={this.parseModels(models)}
                        onChange={this.changeModelName}
                        value={model.getMetadataType()}
                        label={i18n.t("Metadata type")}
                    />
                )}

                {!showOnlySelectedItems && (
                    <DatePicker
                        key={"date-filter"}
                        placeholder={
                            isDelete ? i18n.t("Deleted date") : i18n.t("Last updated date")
                        }
                        value={lastUpdatedDate}
                        onChange={this.changeDateFilter}
                        isFilter
                    />
                )}

                {!showOnlySelectedItems && model && model.getGroupFilterName() && (
                    <Dropdown
                        key={"group-filter"}
                        items={groupFilterData || []}
                        onChange={this.changeGroupFilter}
                        value={groupFilter || ""}
                        label={i18n.t("{{displayName}} Group", { displayName })}
                    />
                )}

                {!showOnlySelectedItems && model && model.getLevelFilterName() && (
                    <Dropdown
                        key={"level-filter"}
                        items={levelFilterData || []}
                        onChange={this.changeLevelFilter}
                        value={levelFilter || ""}
                        label={i18n.t("{{displayName}} Level", { displayName })}
                    />
                )}

                {!isDelete && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                className={classes.checkbox}
                                checked={showOnlySelectedItems}
                                data-test="show-only-selected-items"
                                onChange={this.showSelectedItems}
                            />
                        }
                        label={i18n.t("Only selected items")}
                    />
                )}
            </React.Fragment>
        );
    };

    onSelectionChange = metadataIds => {
        const { notifyNewSelection } = this.props;
        notifyNewSelection(metadataIds);
        this.setState({ metadataIds });
    };

    list = (...params) => {
        const { model, showOnlySelectedItems, metadataIds } = this.state;
        if (!model.listMethod || showOnlySelectedItems) {
            return listByIds(...params, metadataIds);
        } else {
            return model.listMethod(...params);
        }
    };

    render() {
        const { d2, initialSelection, ...rest } = this.props;
        const { model, filters, tableKey, orgUnitChildren } = this.state;

        const selection = _.union(initialSelection, orgUnitChildren);

        return (
            <OldObjectsTable
                key={tableKey}
                d2={d2}
                model={model.getD2Model(d2)}
                columns={model.getColumns()}
                detailsFields={model.getDetails()}
                pageSize={20}
                initialSorting={model.getInitialSorting()}
                initialSelection={selection}
                actions={this.actions}
                list={this.list}
                onSelectionChange={this.onSelectionChange}
                customFiltersComponent={this.renderCustomFilters}
                customFilters={filters}
                forceSelectionColumn={true}
                {...rest}
            />
        );
    }
}

export default withSnackbar(withStyles(styles)(MetadataTable));
