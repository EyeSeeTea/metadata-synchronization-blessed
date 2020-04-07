import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import axios from "axios";
import { D2Api, useD2, useD2Api } from "d2-api";
import {
    DatePicker,
    ObjectsTable,
    ObjectsTableProps,
    OrgUnitsSelector,
    ReferenceObject,
    TableAction,
    TableColumn,
    TablePagination,
    TableSelection,
    TableSorting,
    TableState,
} from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { ChangeEvent, ReactNode, useEffect, useMemo, useState } from "react";
import i18n from "../../locales";
import { D2Model } from "../../models/dhis/default";
import { DataElementModel } from "../../models/dhis/metadata";
import { D2 } from "../../types/d2";
import { d2BaseModelFields, MetadataType } from "../../utils/d2";
import { cleanOrgUnitPaths, getRootOrgUnit } from "../../utils/synchronization";
import Dropdown from "../dropdown/Dropdown";
import { getAllIdentifiers, getFilterData, getOrgUnitSubtree, getRows } from "./utils";

interface MetadataTableProps extends Omit<ObjectsTableProps<MetadataType>, "rows" | "columns"> {
    api?: D2Api;
    filterRows?: string[];
    models: typeof D2Model[];
    selectedIds?: string[];
    excludedIds?: string[];
    childrenKeys?: string[];
    initialShowOnlySelected?: boolean;
    additionalColumns?: TableColumn<MetadataType>[];
    additionalFilters?: ReactNode;
    additionalActions?: TableAction<MetadataType>[];
    showIndeterminateSelection?: boolean;
    notifyNewSelection?(selectedIds: string[], excludedIds: string[]): void;
    notifyNewModel?(model: typeof D2Model): void;
    notifyRowsChange?(rows: MetadataType[]): void;
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
    metadataFilter: {
        order: 1,
    },
    dateFilter: {
        order: 2,
    },
    groupFilter: {
        order: 3,
    },
    levelFilter: {
        order: 4,
    },
    onlySelectedFilter: {
        order: 5,
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
    parentOrgUnits: string[] | null;
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

const uniqCombine = (items: any[]) =>
    _(items)
        .reverse()
        .uniqBy("name")
        .reverse()
        .value();

const MetadataTable: React.FC<MetadataTableProps> = ({
    api: providedApi,
    filterRows,
    models,
    selectedIds = [],
    excludedIds = [],
    notifyNewSelection = _.noop,
    notifyNewModel = _.noop,
    notifyRowsChange = _.noop,
    childrenKeys = [],
    additionalColumns = [],
    additionalFilters = null,
    additionalActions = [],
    loading: providedLoading,
    initialShowOnlySelected = false,
    showIndeterminateSelection = false,
    ...rest
}) => {
    const d2 = useD2() as D2;
    const defaultApi = useD2Api();
    const api = providedApi ?? defaultApi;
    const classes = useStyles({});

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const [ids, updateIds] = useState<string[]>([]);
    const [search, updateSearch] = useState<string | undefined>(undefined);
    const [sorting, updateSorting] = useState<TableSorting<MetadataType>>(initialState.sorting);
    const [pagination, updatePagination] = useState<Partial<TablePagination>>(
        initialState.pagination
    );
    const [filters, updateFilters] = useState<FiltersState>({
        lastUpdated: null,
        group: "",
        groupData: [],
        level: "",
        levelData: [],
        showOnlySelected: initialShowOnlySelected,
        selectedIds: selectedIds,
        parentOrgUnits: null,
    });
    const [expandOrgUnits, updateExpandOrgUnits] = useState<string[]>();

    const [error, setError] = useState<string>();
    const [rows, setRows] = useState<MetadataType[]>([]);
    const [pager, setPager] = useState<Partial<TablePagination>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const changeModelFilter = (modelName: string) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model = _.find(models, model => model.getMetadataType() === modelName) ?? models[0];
        updateModel(() => model);
        notifyNewModel(model);
    };

    const changeLastUpdatedFilter = (date: Date | null) => {
        updateFilters(state => ({ ...state, lastUpdated: date }));
    };

    const changeGroupFilter = (group: string) => {
        updateFilters(state => ({ ...state, group }));
    };

    const changeLevelFilter = (level: string) => {
        updateFilters(state => ({ ...state, level, parentOrgUnits: [] }));
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

    const selectOrgUnitChildren = async (selectedOUs: string[]) => {
        const ids = new Set<string>();
        for (const selectedOU of selectedOUs) {
            const subtree = await getOrgUnitSubtree(api, selectedOU);
            subtree.forEach(id => ids.add(id));
        }
        const includedIds = _.uniq([...selectedIds, ...Array.from(ids)]);
        notifyNewSelection(includedIds, excludedIds);

        const orgUnitPaths = _(rows)
            .intersectionBy(
                selectedOUs.map(id => ({ id })),
                "id"
            )
            .map(({ path }) => path)
            .compact()
            .value();
        updateExpandOrgUnits(orgUnitPaths);
        changeParentOrgUnitFilter(orgUnitPaths);
    };

    const addToSelection = (ids: string[]) => {
        const oldSelection = _.difference(selectedIds, ids);
        const newSelection = _.difference(ids, selectedIds);

        notifyNewSelection([...oldSelection, ...newSelection], excludedIds);
    };

    const filterComponents = (
        <React.Fragment key={"metadata-table-filters"}>
            {models.length > 1 && (
                <div className={classes.metadataFilter}>
                    <Dropdown
                        items={models.map(model => ({
                            id: model.getMetadataType(),
                            name: model.getModelName(d2),
                        }))}
                        onValueChange={changeModelFilter}
                        value={model.getMetadataType()}
                        label={i18n.t("Metadata type")}
                        hideEmpty={true}
                    />
                </div>
            )}

            <div className={classes.dateFilter}>
                <DatePicker
                    placeholder={i18n.t("Last updated date")}
                    value={filters.lastUpdated}
                    onChange={changeLastUpdatedFilter}
                    isFilter={true}
                />
            </div>

            {model.getGroupFilterName() && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={filters.groupData}
                        onValueChange={changeGroupFilter}
                        value={filters.group}
                        label={i18n.t("{{displayName}} Group", {
                            displayName: model.getModelName(d2),
                        })}
                    />
                </div>
            )}

            {model.getLevelFilterName() && (
                <div className={classes.levelFilter}>
                    <Dropdown
                        items={filters.levelData}
                        onValueChange={changeLevelFilter}
                        value={filters.level}
                        label={i18n.t("{{displayName}} Level", {
                            displayName: model.getModelName(d2),
                        })}
                    />
                </div>
            )}

            <div className={classes.onlySelectedFilter}>
                <FormControlLabel
                    className={classes.checkbox}
                    control={
                        <Checkbox
                            checked={filters.showOnlySelected}
                            onChange={changeOnlySelectedFilter}
                        />
                    }
                    label={i18n.t("Only selected items")}
                />
            </div>

            {additionalFilters}
        </React.Fragment>
    );

    const sideComponents = model.getCollectionName() === "organisationUnits" && (
        <div key={"org-unit-selector-filter"} className={classes.orgUnitFilter}>
            <OrgUnitsSelector
                api={api}
                withElevation={true}
                controls={{}}
                hideCheckboxes={true}
                hideMemberCount={true}
                fullWidth={false}
                height={500}
                square={true}
                onChange={changeParentOrgUnitFilter}
                selected={filters.parentOrgUnits ?? []}
                singleSelection={true}
                selectOnClick={true}
                initiallyExpanded={expandOrgUnits}
            />
        </div>
    );

    const tableActions = [
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

    const handleError = (error: Error) => {
        if (!axios.isCancel(error)) {
            setError("There was an error with the request");
            console.error(error);
        }
    };

    const apiModel = model.getApiModel(api);
    const apiQuery = useMemo(() => {
        const query: any = {
            fields: model ? model.getFields() : d2BaseModelFields,
            filter: {
                lastUpdated: filters.lastUpdated
                    ? { ge: moment(filters.lastUpdated).format("YYYY-MM-DD") }
                    : undefined,
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
            filters.parentOrgUnits &&
            filters.parentOrgUnits.length > 0 &&
            model.getCollectionName() === "organisationUnits"
        ) {
            query.filter["parent.id"] = { in: cleanOrgUnitPaths(filters.parentOrgUnits ?? []) };
            query.order = "displayName:asc";
        }

        if (query.filter && filters.showOnlySelected) {
            query.filter["id"] = { in: filters.selectedIds };
        } else if (query.filter && !!filterRows) {
            query.filter["id"] = { in: filterRows };
        }

        return query;
    }, [model, filters, filterRows]);

    useEffect(() => {
        if (apiModel.modelName === "organisationUnits") return;
        const { cancel, response } = getAllIdentifiers(
            apiModel.modelName,
            api.apiPath,
            search,
            apiQuery,
            apiModel
        );

        response
            .then(({ data }) => _.map(data.objects, "id"))
            .then(updateIds)
            .catch(handleError);

        return cancel;
    }, [api, apiModel, apiQuery, search]);

    useEffect(() => {
        if (apiModel.modelName !== "organisationUnits") return;

        const { cancel, response } = getRootOrgUnit(api);

        response.then(({ data }) => {
            changeParentOrgUnitFilter(data.objects.map(({ path }) => path));
        });

        return cancel;
    }, [api, apiModel.modelName]);

    useEffect(() => {
        if (apiModel.modelName === "organisationUnits" && !filters.parentOrgUnits) return;

        const { cancel, response } = getRows(
            apiModel.modelName,
            api.apiPath,
            sorting,
            pagination,
            search,
            apiQuery,
            apiModel
        );

        setLoading(true);
        response
            .then(({ data }) => {
                const { objects, pager } = data;
                const rows = model.getApiModelTransform()(objects);
                notifyRowsChange(rows);

                setRows(rows);
                setPager(pager);
                setLoading(false);
            })
            .catch(handleError);

        return cancel;
    }, [
        api,
        apiModel,
        apiQuery,
        sorting,
        pagination,
        search,
        model,
        notifyRowsChange,
        filterRows,
        filters.parentOrgUnits,
    ]);

    useEffect(() => {
        if (model && model.getGroupFilterName()) {
            getFilterData(
                model.getGroupFilterName(),
                "group",
                api.apiPath,
                api
            ).then(({ objects }) => updateFilters(state => ({ ...state, groupData: objects })));
        }

        if (model && model.getLevelFilterName()) {
            getFilterData(model.getLevelFilterName(), "level", api.apiPath, api).then(
                ({ objects }) => {
                    // Inference does not work for orgUnits here
                    const levels = (objects as unknown) as { name: string; level: number }[];
                    updateFilters(state => ({
                        ...state,
                        levelData: levels.map(({ name, level }) => ({
                            id: String(level),
                            name: `${level}. ${name}`,
                        })),
                    }));
                }
            );
        }
    }, [d2, api, model]);

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { sorting, pagination, selection } = tableState;

        const included = _.reject(selection, { indeterminate: true }).map(({ id }) => id);
        const newlySelectedIds = _.difference(included, selectedIds);
        const newlyUnselectedIds = _.difference(selectedIds, included);

        const parseChildren = (ids: string[]) =>
            _(rows)
                .filter(({ id }) => !!ids.includes(id))
                .map(row => (_.values(_.pick(row, childrenKeys)) as unknown) as MetadataType)
                .flattenDeep()
                .map(({ id }) => id)
                .value();

        const excluded = _(excludedIds)
            .union(newlyUnselectedIds)
            .difference(parseChildren(newlyUnselectedIds))
            .difference(newlySelectedIds)
            .difference(parseChildren(newlySelectedIds))
            .filter(id => !_.find(rows, { id }))
            .value();

        updateSorting(sorting);
        updatePagination(pagination);
        notifyNewSelection(included, excluded);
        updateFilters(state => ({
            ...state,
            selectedIds: included,
        }));
    };

    const exclusion = excludedIds.map(id => ({ id }));
    const selection = selectedIds.map(id => ({
        id,
        checked: true,
        indeterminate: false,
    }));

    const childrenSelection: TableSelection[] = showIndeterminateSelection
        ? _(rows)
              .intersectionBy(selection, "id")
              .map(row => (_.values(_.pick(row, childrenKeys)) as unknown) as MetadataType[])
              .flattenDeep()
              .differenceBy(selection, "id")
              .differenceBy(exclusion, "id")
              .map(({ id }) => {
                  return {
                      id,
                      checked: true,
                      indeterminate: !_.find(selection, { id }),
                  };
              })
              .value()
        : [];

    const columns = uniqCombine([...model.getColumns(), ...additionalColumns]);
    const actions = uniqCombine([...tableActions, ...additionalActions]);

    if (error) return <p>{error}</p>;

    return (
        <ObjectsTable<MetadataType>
            rows={rows}
            columns={columns}
            details={model.getDetails()}
            onChangeSearch={updateSearch}
            initialState={initialState}
            searchBoxLabel={i18n.t("Search by name")}
            pagination={pager}
            onChange={handleTableChange}
            ids={ids}
            loading={providedLoading || loading}
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
