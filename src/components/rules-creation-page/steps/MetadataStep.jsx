import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import memoize from "nano-memoize";
import { DatePicker, ObjectsTable } from "d2-ui-components";

import Dropdown from "../../dropdown/Dropdown";
import { d2ModelFactory } from "../../../models/d2ModelFactory";
import { listByIds } from "../../../logic/metadata";
import { d2BaseModelDetails } from "../../../utils/d2";

class MetadataStep extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        syncRule: PropTypes.object.isRequired,
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
        getMetadataType: () => "selected",
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
        },
        groupFilterData: [],
        levelFilterData: [],
        selectedIds: this.props.syncRule.selectedIds,
    };

    models = [
        {
            name: i18n.t("Selected elements"),
            id: this.defaultModel.getMetadataType(),
        },
        {
            name: this.props.d2.models["organisationUnit"].displayName,
            id: this.props.d2.models["organisationUnit"].name,
        },
        {
            name: this.props.d2.models["validationRule"].displayName,
            id: this.props.d2.models["validationRule"].name,
        },
        {
            name: this.props.d2.models["indicator"].displayName,
            id: this.props.d2.models["indicator"].name,
        },
        {
            name: this.props.d2.models["dataElement"].displayName,
            id: this.props.d2.models["dataElement"].name,
        },
    ];

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];
    updateFilterData = memoize(async model => {
        const { d2 } = this.props;
        const newState = {};

        if (model && model.getGroupFilterName()) {
            const groupClass = d2ModelFactory(d2, model.getGroupFilterName());
            const groupList = await groupClass.listMethod(
                d2,
                { customFields: ["id", "name"] },
                { paging: false }
            );
            newState.groupFilterData = groupList.objects;
        }

        if (model && model.getLevelFilterName()) {
            const orgUnitLevelsClass = d2ModelFactory(d2, model.getLevelFilterName());
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

    changeSelection = selectedIds => {
        this.props.syncRule.selectedIds = selectedIds;
        this.setState({ selectedIds });
    };

    changeModelName = event => {
        const { d2 } = this.props;
        this.setState({
            model:
                event.target.value !== "selected"
                    ? d2ModelFactory(d2, event.target.value)
                    : this.defaultModel,
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

    renderCustomFilters = () => {
        const { d2 } = this.props;
        const { model, groupFilterData, levelFilterData, filters } = this.state;
        const { lastUpdatedDate, groupFilter, levelFilter } = filters;
        const displayName = model.getD2Model(d2).displayName;

        return (
            <React.Fragment>
                <Dropdown
                    key={"model-filter"}
                    items={this.models}
                    onChange={this.changeModelName}
                    value={model.getMetadataType()}
                    label={i18n.t("Metadata type")}
                    hideEmpty
                />

                {model !== this.defaultModel && (
                    <DatePicker
                        key={"date-filter"}
                        placeholder={i18n.t("Last updated date")}
                        value={lastUpdatedDate}
                        onChange={this.changeDateFilter}
                        isFilter
                    />
                )}

                {model && model.getGroupFilterName() && (
                    <Dropdown
                        key={"group-filter"}
                        items={groupFilterData || []}
                        onChange={this.changeGroupFilter}
                        value={groupFilter || ""}
                        label={i18n.t("{{displayName}} Group", { displayName })}
                    />
                )}

                {model && model.getLevelFilterName() && (
                    <Dropdown
                        key={"level-filter"}
                        items={levelFilterData || []}
                        onChange={this.changeLevelFilter}
                        value={levelFilter || ""}
                        label={i18n.t("{{displayName}} Level", { displayName })}
                    />
                )}
            </React.Fragment>
        );
    };

    list = (...params) => {
        const { model, selectedIds } = this.state;
        if (model.listMethod) {
            return model.listMethod(...params);
        } else {
            return listByIds(...params, selectedIds);
        }
    };

    render() {
        const { d2, syncRule } = this.props;
        const { model, filters } = this.state;

        return (
            <ObjectsTable
                d2={d2}
                model={model.getD2Model(d2)}
                columns={model.getColumns()}
                detailsFields={model.getDetails()}
                pageSize={10}
                initialSorting={model.getInitialSorting()}
                actions={this.actions}
                list={this.list}
                onSelectionChange={this.changeSelection}
                customFiltersComponent={this.renderCustomFilters}
                customFilters={filters}
                initialSelection={syncRule.selectedIds}
            />
        );
    }
}

export default MetadataStep;
