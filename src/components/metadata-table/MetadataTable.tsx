import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import { useD2, useD2Api, useD2ApiData } from "d2-api";
import D2ApiModel from "d2-api/api/models";
import {
    DatePicker,
    ObjectsTable,
    ObjectsTableProps,
    OrgUnitsSelector,
    ReferenceObject,
    TableSelection,
    TableSorting,
    TableState,
} from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import i18n from "../../locales";
import { getOrgUnitSubtree } from "../../logic/utils";
import { D2Model, DataElementModel } from "../../models/d2Model";
import { D2 } from "../../types/d2";
import { NamedRef } from "../../types/synchronization";
import { d2BaseModelFields, MetadataType } from "../../utils/d2";
import { cleanOrgUnitPaths, getRootOrgUnit } from "../../utils/synchronization";
import Dropdown from "../dropdown/Dropdown";
import { getAllIdentifiers, getFilterData } from "./utils";

interface MetadataTableProps extends Omit<ObjectsTableProps<MetadataType>, "rows" | "columns"> {
    models: typeof D2Model[];
    selectedIds?: string[];
    excludedIds?: string[];
    notifyNewSelection?(selectedIds: string[], excludedIds: string[]): void;
    childrenKeys?: string[];
}

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
    orgUnitFilter: {
        order: -1,
        marginRight: "1rem",
    },
});

interface FiltersState {
    lastUpdated: Date | null;
    group: string;
    level: string;
    showOnlySelected: boolean;
    selectedIds: string[];
    groupData: {
        id: string;
        name: string;
    }[];
    levelData: {
        id: string;
        name: string;
    }[];
    parentOrgUnits: string[];
}

const initialState = {
    sorting: {
        field: "displayName" as const,
        order: "asc" as const,
    },
    pagination: {
        page: 1,
        pageSize: 25,
    },
};

const MetadataTable: React.FC<MetadataTableProps> = ({
    models,
    selectedIds = [],
    excludedIds = [],
    notifyNewSelection = _.noop,
    childrenKeys = [],
    ...rest
}) => {
    const d2 = useD2() as D2;
    const api = useD2Api();
    const classes = useStyles({});

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] || DataElementModel);
    const [ids, updateIds] = useState<string[]>([]);
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState<TableSorting<MetadataType>>(initialState.sorting);
    const [pagination, updatePagination] = useState(initialState.pagination);
    const [filters, updateFilters] = useState<FiltersState>({
        lastUpdated: null,
        group: "",
        groupData: [],
        level: "",
        levelData: [],
        showOnlySelected: false,
        selectedIds: [],
        parentOrgUnits: [],
    });

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
        updateFilters(state => ({ ...state, level: event.target.value, parentOrgUnits: [] }));
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateFilters(state => ({
            ...state,
            selectedIds,
            showOnlySelected: event.target?.checked,
        }));
    };

    const changeParentOrgUnitFilter = (parentOrgUnits: string[]) => {
        updateFilters(state => ({
            ...state,
            parentOrgUnits,
            level: "",
        }));
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

    const filterComponents = _.compact([
        models.length > 1 && (
            <Dropdown
                key={"metadata-filter"}
                items={models.map(model => ({
                    id: model.getMetadataType(),
                    name: model.getD2Model(d2).displayName,
                }))}
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

    const sideComponents = model.getCollectionName() === "organisationUnits" && (
        <div className={classes.orgUnitFilter}>
            <OrgUnitsSelector
                key={"org-unit-selector"}
                d2={d2}
                withElevation={true}
                controls={{}}
                hideCheckboxes={true}
                hideMemberCount={true}
                fullWidth={false}
                height={500}
                square={true}
                onChange={changeParentOrgUnitFilter}
                selected={filters.parentOrgUnits}
                singleSelection={true}
                selectOnClick={true}
            />
        </div>
    );

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

    const apiModel = model.getApiModel(api);
    const apiQuery = useMemo(() => {
        const query: Parameters<InstanceType<typeof D2ApiModel>["get"]>[0] = {
            fields: model ? model.getFields() : d2BaseModelFields,
            filter: {
                lastUpdated: filters.lastUpdated
                    ? { ge: moment(filters.lastUpdated).format("YYYY-MM-DD") }
                    : undefined,
                id: filters.showOnlySelected ? { in: filters.selectedIds } : undefined,
                ...model.getApiModelFilters(),
            },
        };

        if (query.filter && model.getGroupFilterName()) {
            query.filter[`${model.getGroupFilterName()}.id`] = { eq: filters.group };
        }

        if (query.filter && model.getLevelFilterName()) {
            query.filter["level"] = { eq: filters.level };
        }

        if (
            query.filter &&
            filters.parentOrgUnits.length > 0 &&
            model.getCollectionName() === "organisationUnits"
        ) {
            query.filter["parent.id"] = { in: cleanOrgUnitPaths(filters.parentOrgUnits) };
        }

        return query;
    }, [model, filters]);

    const { loading, data, error, refetch } = useD2ApiData<any>();

    useEffect(() => {
        getAllIdentifiers(apiModel.modelName, search, apiModel, apiQuery).then(updateIds);
    }, [apiModel, apiQuery, search]);

    useEffect(() => {
        getRootOrgUnit(api).then(({ objects: roots }) =>
            changeParentOrgUnitFilter(roots.map(({ path }) => path))
        );
    }, [api]);

    useEffect(
        () =>
            refetch(
                apiModel.get({
                    order: `${sorting.field}:i${sorting.order}`,
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    ...apiQuery,
                    filter: {
                        name: { ilike: search },
                        ...apiQuery.filter,
                    },
                })
            ),
        [apiModel, apiQuery, refetch, sorting, pagination, search]
    );

    useEffect(() => {
        if (model && model.getGroupFilterName()) {
            getFilterData(model.getGroupFilterName(), "group", d2, api).then(({ objects }) =>
                updateFilters(state => ({ ...state, groupData: objects }))
            );
        }

        if (model && model.getLevelFilterName()) {
            getFilterData(model.getLevelFilterName(), "level", d2, api).then(({ objects }) => {
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

    if (error) return <p>{"Error: " + JSON.stringify(error)}</p>;

    const { objects, pager } = data || { objects: [], pager: undefined };
    const rows = model.getApiModelTransform()(objects);

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { sorting, pagination, selection } = tableState;

        const included = _.reject(selection, { indeterminate: true }).map(({ id }) => id);
        const newlySelectedIds = _.difference(included, selectedIds);
        const newlyUnselectedIds = _.difference(selectedIds, included);

        const childrenOfNewlySelected = _(rows)
            .filter(({ id }) => !!newlySelectedIds.includes(id))
            .map(row => (_.values(_.pick(row, childrenKeys)) as unknown) as MetadataType)
            .flattenDeep()
            .map(({ id }) => id)
            .value();

        const excluded = _(excludedIds)
            .union(newlyUnselectedIds)
            .difference(childrenOfNewlySelected)
            .filter(id => !_.find(rows, { id }))
            .value();

        updateSorting(sorting);
        updatePagination(pagination);
        notifyNewSelection(included, excluded);
    };

    const exclusion = excludedIds.map(id => ({ id }));
    const selection = selectedIds.map(id => ({
        id,
        checked: true,
        indeterminate: false,
    }));

    const childrenSelection: TableSelection[] = _(rows)
        .intersectionBy(selection, "id")
        .map(row => (_.values(_.pick(row, childrenKeys)) as unknown) as MetadataType)
        .flattenDeep()
        .differenceBy(selection, "id")
        .differenceBy(exclusion, "id")
        .map(({ id }) => {
            return {
                id,
                checked: true,
                indeterminate: !_.find(selection, { id }),
            } as TableSelection;
        })
        .value();

    return (
        <ObjectsTable<MetadataType>
            rows={rows}
            columns={model.getColumns()}
            details={model.getDetails()}
            onChangeSearch={updateSearch}
            initialState={initialState}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            ids={ids}
            loading={loading}
            selection={[...selection, ...childrenSelection]}
            childrenKeys={childrenKeys}
            filterComponents={filterComponents}
            forceSelectionColumn={true}
            actions={actions}
            sideComponents={sideComponents}
            {...rest}
        />
    );
};

export default MetadataTable;
