import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import { D2Api, useD2, useD2Api } from "d2-api";
import D2ApiModel from "d2-api/api/models";
import { DatePicker, ReferenceObject, TableState } from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import memoize from "nano-memoize";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import i18n from "../../locales";
import { getOrgUnitSubtree } from "../../logic/utils";
import { D2Model, DataElementModel } from "../../models/d2Model";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import { D2 } from "../../types/d2";
import { NamedRef } from "../../types/synchronization";
import { d2BaseModelFields, MetadataType } from "../../utils/d2";
import D2ObjectsTable, { D2ObjectsTableProps } from "../d2-objects-table/D2ObjectsTable";
import Dropdown from "../dropdown/Dropdown";

interface MetadataTableProps
    extends Omit<D2ObjectsTableProps<MetadataType>, "columns" | "apiModel"> {
    models: typeof D2Model[];
    selectedIds?: string[];
    excludedIds?: string[];
    notifyNewSelection?(selectedIds: string[], excludedIds: []): void;
}

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
});

const getData = memoize(
    (modelName: string, type: "group" | "level", d2: D2, api: D2Api) =>
        d2ModelFactory(d2, modelName)
            .getApiModel(api)
            .get({
                paging: false,
                fields:
                    type === "group"
                        ? {
                              id: true as true,
                              name: true as true,
                          }
                        : {
                              name: true as true,
                              level: true as true,
                          },
                order: type === "group" ? undefined : `level:iasc`,
            })
            .getData(),
    { maxArgs: 2 }
);

interface FiltersState {
    lastUpdated: Date | null;
    group: string;
    level: string;
    showOnlySelected: boolean;
    groupData: {
        id: string;
        name: string;
    }[];
    levelData: {
        id: string;
        name: string;
    }[];
}

const MetadataTable: React.FC<MetadataTableProps> = ({
    models,
    selectedIds = [],
    excludedIds = [],
    notifyNewSelection = _.noop,
    ...rest
}) => {
    const d2 = useD2() as D2;
    const api = useD2Api();
    const classes = useStyles({});

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] || DataElementModel);
    const [filters, updateFilters] = useState<FiltersState>({
        lastUpdated: null,
        group: "",
        groupData: [],
        level: "",
        levelData: [],
        showOnlySelected: false,
    });

    useEffect(() => {
        if (model && model.getGroupFilterName()) {
            getData(model.getGroupFilterName(), "group", d2, api).then(({ objects }) =>
                updateFilters(state => ({ ...state, groupData: objects }))
            );
        }

        if (model && model.getLevelFilterName()) {
            getData(model.getLevelFilterName(), "level", d2, api).then(({ objects }) => {
                // Inference does not work for orgUnits here
                const levels = (objects as unknown) as { name: string; level: number }[];
                updateFilters(state => ({
                    ...state,
                    levelData: levels.map(({ name, level }) => ({
                        id: String(level),
                        name: `${level}. ${name}`,
                    })),
                }));
            });
        }
    }, [d2, api, model]);

    const changeDropdownFilter = (event: ChangeEvent<HTMLInputElement>) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model =
            _.find(models, model => model.getMetadataType() === event.target.value) || models[0];
        updateModel(() => model);
    };

    const changeLastUpdatedFilter = (date: Date | null) => {
        updateFilters(state => ({ ...state, lastUpdated: date }));
    };

    const changeGroupFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateFilters(state => ({ ...state, group: event.target.value }));
    };

    const changeLevelFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateFilters(state => ({ ...state, level: event.target.value }));
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateFilters(state => ({ ...state, showOnlySelected: event.target.checked }));
    };

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        const tableSelectedIds = selection.map(({ id }) => id);
        const newSelectedIds = _.reject(tableSelectedIds, { indeterminate: true });
        const newExcludedIds = _.difference(selectedIds, tableSelectedIds);

        notifyNewSelection(newSelectedIds, newExcludedIds);
    };

    const selectOrgUnitChildren = async (selectedOUs: NamedRef[]) => {
        const ids = new Set<string>();
        for (const selectedOU of selectedOUs) {
            const subtree = await getOrgUnitSubtree(d2 as D2, selectedOU.id);
            subtree.forEach(id => ids.add(id));
        }
        notifyNewSelection([...selectedIds, ...Array.from(ids)], excludedIds);
    };

    const addToSelection = (items: NamedRef[]) => {
        const ids = items.map(({ id }) => id);
        const oldSelection = _.difference(selectedIds, ids);
        const newSelection = _.difference(ids, selectedIds);

        notifyNewSelection([...oldSelection, ...newSelection], excludedIds);
    };

    const groupTypes = models.map(model => ({
        id: model.getMetadataType(),
        name: model.getD2Model(d2).displayName,
    }));

    const apiQuery: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0] = useMemo(() => {
        // TODO: Update in d2-api type definition with field accessor
        const query: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0] = {
            fields: model ? model.getFields() : d2BaseModelFields,
            filter: {
                lastUpdated: filters.lastUpdated
                    ? { ge: moment(filters.lastUpdated).format("YYYY-MM-DD") }
                    : undefined,
                id: filters.showOnlySelected ? { in: selectedIds } : undefined,
                ...model.getApiModelFilters(),
            },
        };

        if (query.filter && model.getGroupFilterName()) {
            query.filter[`${model.getGroupFilterName()}.id`] = { eq: filters.group };
        }

        if (query.filter && model.getLevelFilterName()) {
            query.filter["level"] = { eq: filters.level };
        }

        return query;
    }, [
        model,
        selectedIds,
        filters.lastUpdated,
        filters.showOnlySelected,
        filters.group,
        filters.level,
    ]);

    const filterComponents = _.compact([
        models.length > 1 && (
            <Dropdown
                key={"metadata-filter"}
                items={groupTypes}
                onChange={changeDropdownFilter}
                value={model.getMetadataType()}
                label={i18n.t("Metadata type")}
                hideEmpty={true}
            />
        ),
        <DatePicker
            key={"date-filter"}
            placeholder={i18n.t("Last updated date")}
            value={filters.lastUpdated}
            onChange={changeLastUpdatedFilter}
            isFilter
        />,
        model.getGroupFilterName() && (
            <Dropdown
                key={"group-filter"}
                items={filters.groupData}
                onChange={changeGroupFilter}
                value={filters.group}
                label={i18n.t("{{displayName}} Group", {
                    displayName: model.getD2Model(d2).displayName,
                })}
            />
        ),
        model.getLevelFilterName() && (
            <Dropdown
                key={"level-filter"}
                items={filters.levelData}
                onChange={changeLevelFilter}
                value={filters.level}
                label={i18n.t("{{displayName}} Level", {
                    displayName: model.getD2Model(d2).displayName,
                })}
            />
        ),
        <FormControlLabel
            key={"only-selected-filter"}
            className={classes.checkbox}
            control={
                <Checkbox
                    checked={filters.showOnlySelected}
                    data-test="show-only-selected-items"
                    onChange={changeOnlySelectedFilter}
                />
            }
            label={i18n.t("Only selected items")}
        />,
    ]);

    const actions = [
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
            onClick: selectOrgUnitChildren,
            icon: <DoneAllIcon />,
            isActive: () => {
                return model.getMetadataType() === "organisationUnit";
            },
        },
        {
            name: "select",
            text: i18n.t("Select"),
            primary: true,
            multiple: true,
            onClick: addToSelection,
            isActive: () => false,
        },
    ];

    const initialState = {
        sorting: {
            field: "displayName" as const,
            order: "asc" as const,
        },
    };

    return (
        <D2ObjectsTable<MetadataType>
            apiModel={model.getApiModel(api)}
            apiQuery={apiQuery}
            transformObjects={model.getApiModelTransform()}
            columns={model.getColumns()}
            details={model.getDetails()}
            filterComponents={filterComponents}
            forceSelectionColumn={true}
            actions={actions}
            selection={selectedIds.map(id => ({ id }))}
            exclusion={excludedIds.map(id => ({ id }))}
            onChange={handleTableChange}
            initialState={initialState}
            {...rest}
        />
    );
};

export default MetadataTable;
