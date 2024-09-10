import { Box, Checkbox, FormControlLabel, Icon, Paper, Tooltip, makeStyles } from "@material-ui/core";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import { isCancel } from "@eyeseetea/d2-api";
import {
    DatePicker,
    ObjectsTable,
    ObjectsTableDetailField,
    ObjectsTableProps,
    OrgUnitsSelector,
    ReferenceObject,
    TableAction,
    TableColumn,
    TablePagination,
    TableSelection,
    TableState,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NamedRef } from "../../../../../domain/common/entities/Ref";
import { DataSource, isDhisInstance, isJSONDataSource } from "../../../../../domain/instance/entities/DataSource";
import { MetadataResponsible } from "../../../../../domain/metadata/entities/MetadataResponsible";
import { ListMetadataParams } from "../../../../../domain/metadata/repositories/MetadataRepository";
import i18n from "../../../../../locales";
import { D2Model } from "../../../../../models/dhis/default";
import { DataElementModel } from "../../../../../models/dhis/metadata";
import { MetadataType } from "../../../../../utils/d2";
import { useAppContext } from "../../contexts/AppContext";
import Dropdown from "../dropdown/Dropdown";
import { ResponsibleDialog } from "../responsible-dialog/ResponsibleDialog";
import { getFilterData, getOrgUnitSubtree } from "./utils";
import { Toggle } from "../toggle/Toggle";

export type MetadataTableFilters =
    | "group"
    | "level"
    | "program"
    | "optionSet"
    | "category"
    | "orgUnit"
    | "lastUpdated"
    | "onlySelected"
    | "disableFilterRows"
    | "programType"
    | "domainType";

export interface MetadataTableProps extends Omit<ObjectsTableProps<MetadataType>, "rows" | "columns"> {
    remoteInstance?: DataSource;
    filterRows?: string[];
    transformRows?: (rows: MetadataType[]) => MetadataType[];
    models: typeof D2Model[];
    selectedIds?: string[];
    excludedIds?: string[];
    childrenKeys?: string[];
    initialShowOnlySelected?: boolean;
    additionalColumns?: TableColumn<MetadataType>[];
    additionalActions?: TableAction<MetadataType>[];
    showIndeterminateSelection?: boolean;
    notifyNewSelection?(selectedIds: string[], excludedIds: string[]): void;
    notifyNewModel?(model: typeof D2Model): void;
    notifyRowsChange?(rows: MetadataType[]): void;
    notifyModelSyncAllChange?(value: boolean): void;
    modelIsSyncAll?: boolean;
    ignoreIds?: string[];
    allowChangingResponsible?: boolean;
    showResponsible?: boolean;
    externalFilterComponents?: ReactNode;
    viewFilters?: MetadataTableFilters[];
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

const uniqCombine = (items: any[]) => {
    return _(items).compact().reverse().uniqBy("name").reverse().value();
};

const MetadataTable: React.FC<MetadataTableProps> = ({
    remoteInstance,
    filterRows,
    transformRows = rows => rows,
    models,
    modelIsSyncAll,
    selectedIds: externalSelection,
    excludedIds = [],
    ignoreIds = [],
    notifyNewSelection = _.noop,
    notifyNewModel = _.noop,
    notifyRowsChange = _.noop,
    notifyModelSyncAllChange = _.noop,
    childrenKeys = [],
    additionalColumns = [],
    additionalActions = [],
    loading: providedLoading,
    initialShowOnlySelected = false,
    showIndeterminateSelection = false,
    allowChangingResponsible = false,
    showResponsible = true,
    externalFilterComponents,
    viewFilters = [
        "group",
        "level",
        "program",
        "optionSet",
        "category",
        "orgUnit",
        "lastUpdated",
        "onlySelected",
        "programType",
        "domainType",
    ],
    ...rest
}) => {
    const { compositionRoot, api: defaultApi } = useAppContext();
    const classes = useStyles();

    const snackbar = useSnackbar();

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const [ids, updateIds] = useState<string[]>([]);
    const [responsibles, updateResponsibles] = useState<MetadataResponsible[]>([]);
    const [sharingSettingsElement, setSharingSettingsElement] = useState<NamedRef>();

    const selectionWithoutExcludedRef = useRef<string[] | undefined>();

    useEffect(() => {
        const updatedSelection = !externalSelection
            ? undefined
            : _.isEqual(externalSelection, ignoreIds)
            ? []
            : _.difference(externalSelection, ignoreIds);

        if (!_.isEqual(updatedSelection, selectionWithoutExcludedRef.current)) {
            selectionWithoutExcludedRef.current = updatedSelection;
        }
    }, [externalSelection, ignoreIds]);

    const selectionWithoutExcluded = selectionWithoutExcludedRef.current;

    const [stateSelection, setStateSelection] = useState<string[]>(selectionWithoutExcluded ?? []);
    const selectedIds = useMemo(
        () => selectionWithoutExcluded ?? stateSelection,
        [selectionWithoutExcluded, stateSelection]
    );

    const [filters, setFilters] = useState<ListMetadataParams>({
        type: model.getCollectionName(),
        showOnlySelected: initialShowOnlySelected,
        order: initialState.sorting,
        page: initialState.pagination.page,
        pageSize: initialState.pagination.pageSize,
        disableFilterRows: false,
        ...model.getApiModelFilters(),
    });

    const updateFilters = useCallback(
        (partialFilters: Partial<ListMetadataParams>) => {
            setFilters(state => ({ ...state, page: 1, ...partialFilters }));
        },
        [setFilters]
    );

    const api =
        remoteInstance && isDhisInstance(remoteInstance)
            ? compositionRoot.instances.getApi(remoteInstance)
            : defaultApi;

    const [expandOrgUnits, updateExpandOrgUnits] = useState<string[]>();
    const [groupFilterData, setGroupFilterData] = useState<NamedRef[]>([]);
    const [levelFilterData, setLevelFilterData] = useState<NamedRef[]>([]);
    const [programFilterData, setProgramFilterData] = useState<NamedRef[]>([]);
    const [optionSetFilterData, setOptionSetFilterData] = useState<NamedRef[]>([]);
    const [categoryFilterData, setCategoryFilterData] = useState<NamedRef[]>([]);

    const [rows, setRows] = useState<MetadataType[]>([]);
    const [pager, setPager] = useState<Partial<TablePagination>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const showResponsibles =
        showResponsible && (model.getCollectionName() === "dataSets" || model.getCollectionName() === "programs");

    const changeModelFilter = (modelName: string) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model = _.find(models, model => model.getMetadataType() === modelName) ?? models[0];
        setRows([]);
        updateModel(() => model);

        notifyNewModel(model);

        //Reset view filters because this filters are not shared between all metadata models
        //and if this one is not initialized to model changes, it provoke errors with old view filters applied
        const initialViewFilters = viewFilters.reduce((acc, viewFilter) => {
            return { ...acc, [viewFilter]: undefined };
        }, {});

        updateFilters({
            ...initialViewFilters,
            type: model.getCollectionName(),
            ...model.getApiModelFilters(),
        });
    };

    const changeSearchFilter = (value: string) => {
        const hasSearch = value.trim() !== "";
        const { field, operator } = model.getSearchFilter();
        updateFilters({
            search: hasSearch ? { field, operator, value } : undefined,
        });
    };

    const changeLastUpdatedFilter = (date: Date | null) => {
        updateFilters({ lastUpdated: date ?? undefined });
    };

    const changeGroupFilter = (value: string) => {
        updateFilters({
            group: { type: model.getGroupFilterName(), value },
        });
    };

    const changeProgramFilter = (program: string) => {
        updateFilters({ program });
    };

    const changeOptionSetFilter = (optionSet: string) => {
        updateFilters({ optionSet });
    };

    const changeCategoryFilter = (category: string) => {
        updateFilters({ category });
    };

    const changeLevelFilter = (level: string) => {
        updateFilters({ level, parents: [] });
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const showOnlySelected = event.target?.checked;
        updateFilters({ showOnlySelected });
    };

    const changeFilterRowsFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const disableFilterRows = event.target?.checked;
        updateFilters({ disableFilterRows });
    };

    const changeOrgUnitsSyncAll = (value: boolean) => {
        // TODO: Sync All Types Feature: use this function and refactor in order to allow all types to be syncAll
        notifyModelSyncAllChange(value);
    };

    const changeParentOrgUnitFilter = useCallback(
        (parents: string[]) => {
            updateFilters({ parents, level: "" });
        },
        [updateFilters]
    );

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

    const openResponsibleDialog = (ids: string[]) => {
        const { id, name } = rows.find(({ id }) => ids[0] === id) ?? {};
        if (!id || !name) return;

        setSharingSettingsElement({ id, name });
    };

    const filterComponents = (
        <React.Fragment key={"metadata-table-filters"}>
            {externalFilterComponents}

            {models.length > 1 && (
                <div className={classes.metadataFilter}>
                    <Dropdown
                        items={models.map(model => ({
                            id: model.getMetadataType(),
                            name: model.getModelName(),
                        }))}
                        onValueChange={changeModelFilter}
                        value={model.getMetadataType()}
                        label={i18n.t("Metadata type")}
                        hideEmpty={true}
                    />
                </div>
            )}

            {viewFilters.includes("lastUpdated") && (
                <div className={classes.dateFilter}>
                    <DatePicker
                        placeholder={i18n.t("Last updated date")}
                        value={filters.lastUpdated ?? null}
                        onChange={changeLastUpdatedFilter}
                        isFilter={true}
                    />
                </div>
            )}

            {viewFilters.includes("group") && model.getGroupFilterName() && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={groupFilterData}
                        onValueChange={changeGroupFilter}
                        value={filters.group?.value ?? ""}
                        label={i18n.t("{{displayName}} Group", {
                            displayName: model.getModelName(),
                        })}
                    />
                </div>
            )}

            {viewFilters.includes("level") && model.getLevelFilterName() && (
                <div className={classes.levelFilter}>
                    <Dropdown
                        items={levelFilterData}
                        onValueChange={changeLevelFilter}
                        value={filters.level ?? ""}
                        label={i18n.t("{{displayName}} Level", {
                            displayName: model.getModelName(),
                        })}
                    />
                </div>
            )}

            {viewFilters.includes("program") && model.getCollectionName() === "programIndicators" && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={programFilterData}
                        onValueChange={changeProgramFilter}
                        value={filters.program ?? ""}
                        label={i18n.t("Program")}
                    />
                </div>
            )}

            {viewFilters.includes("optionSet") && model.getCollectionName() === "options" && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={optionSetFilterData}
                        onValueChange={changeOptionSetFilter}
                        value={filters.optionSet ?? ""}
                        label={i18n.t("Option set")}
                    />
                </div>
            )}

            {viewFilters.includes("category") && model.getCollectionName() === "categoryOptions" && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={categoryFilterData}
                        onValueChange={changeCategoryFilter}
                        value={filters.category ?? ""}
                        label={i18n.t("Category")}
                    />
                </div>
            )}

            {viewFilters.includes("onlySelected") && (
                <div className={classes.onlySelectedFilter}>
                    <FormControlLabel
                        className={classes.checkbox}
                        control={<Checkbox checked={filters.showOnlySelected} onChange={changeOnlySelectedFilter} />}
                        label={i18n.t("Only selected items")}
                    />
                </div>
            )}

            {viewFilters.includes("disableFilterRows") && (
                <div className={classes.onlySelectedFilter}>
                    <FormControlLabel
                        className={classes.checkbox}
                        control={<Checkbox checked={filters.disableFilterRows} onChange={changeFilterRowsFilter} />}
                        label={i18n.t("Show all entries")}
                    />
                </div>
            )}
        </React.Fragment>
    );

    const orgUnitTreeFilter = viewFilters.includes("orgUnit") && model.getCollectionName() === "organisationUnits" && (
        <div key={"org-unit-selector-filter"} className={classes.orgUnitFilter}>
            <Paper elevation={1} square={true}>
                {modelIsSyncAll !== undefined && (
                    <Box pt={1} px={2} pb={modelIsSyncAll ? 1 : 0}>
                        <Toggle
                            label={
                                <Tooltip title={i18n.t("Dynamic auto update")}>
                                    <span>{i18n.t("Sync all Organisation Units")}</span>
                                </Tooltip>
                            }
                            value={Boolean(modelIsSyncAll)}
                            onValueChange={changeOrgUnitsSyncAll}
                        />
                    </Box>
                )}

                {!modelIsSyncAll && (
                    <OrgUnitsSelector
                        api={api}
                        withElevation={false}
                        controls={{}}
                        hideCheckboxes={true}
                        hideMemberCount={true}
                        fullWidth={false}
                        height={500}
                        square={true}
                        onChange={changeParentOrgUnitFilter}
                        selected={filters.parents ?? []}
                        singleSelection={true}
                        selectOnClick={true}
                        initiallyExpanded={expandOrgUnits}
                    />
                )}
            </Paper>
        </div>
    );

    const handleError = useCallback(
        (error: Error) => {
            if (!isCancel(error)) {
                snackbar.error(error.message);
                setRows([]);
                setPager({});
                setLoading(false);
            }
        },
        [snackbar]
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
        {
            name: "set-responsible",
            text: i18n.t("Set metadata custodian"),
            multiple: false,
            icon: <Icon>supervisor_account</Icon>,
            onClick: openResponsibleDialog,
            isActive: () => {
                return allowChangingResponsible && !remoteInstance && showResponsibles;
            },
        },
    ];

    useEffect(() => {
        updateFilters({
            page: initialState.pagination.page,
        });
    }, [updateFilters, remoteInstance]);

    useEffect(() => {
        if (model.getCollectionName() === "organisationUnits") return;
        if (remoteInstance && isJSONDataSource(remoteInstance)) return;

        compositionRoot.metadata
            .listAll({ ...filters, filterRows, fields: { id: true } }, remoteInstance)
            .then(objects => {
                updateIds(objects.map(({ id }) => id));
            });
    }, [filters, filterRows, model, compositionRoot, remoteInstance]);

    useEffect(() => {
        if (model.getCollectionName() !== "organisationUnits") return;
        if (remoteInstance && isJSONDataSource(remoteInstance)) {
            changeParentOrgUnitFilter([]);
            return;
        }

        compositionRoot.instances
            .getOrgUnitRoots(remoteInstance)
            .then(roots => changeParentOrgUnitFilter(roots.map(({ path }) => path)))
            .catch(handleError);
    }, [compositionRoot, remoteInstance, model, handleError, changeParentOrgUnitFilter]);

    useEffect(() => {
        if (model.getCollectionName() === "organisationUnits" && !filters.parents) return;
        const fields = model.getFields();
        const includeParents = model.getCollectionName() === "organisationUnits";

        setLoading(true);
        compositionRoot.metadata
            .list({ ...filters, selectedIds, filterRows, fields, includeParents }, remoteInstance)
            .then(({ objects, pager }) => {
                const rows = model.getApiModelTransform()(objects as unknown as MetadataType[]);

                notifyRowsChange(rows);

                setRows(rows);
                setPager(pager);
                setLoading(false);
            })
            .catch(handleError);
    }, [compositionRoot, notifyRowsChange, remoteInstance, filters, filterRows, model, handleError, selectedIds]);

    useEffect(() => {
        if (model && model.getGroupFilterName()) {
            getFilterData(model.getGroupFilterName(), "group", api.apiPath, api).then(({ objects }) =>
                setGroupFilterData(objects)
            );
        }

        if (model && model.getLevelFilterName()) {
            getFilterData(model.getLevelFilterName(), "level", api.apiPath, api).then(({ objects }) => {
                setLevelFilterData(
                    objects.map(({ name, level }) => ({
                        id: String(level),
                        name: `${level}. ${name}`,
                    }))
                );
            });
        }

        if (model.getCollectionName() === "programIndicators") {
            getFilterData("programs", "group", api.apiPath, api).then(({ objects }) => setProgramFilterData(objects));
        }

        if (model.getCollectionName() === "options") {
            getFilterData("optionSets", "group", api.apiPath, api).then(({ objects }) =>
                setOptionSetFilterData(objects)
            );
        }

        if (model.getCollectionName() === "categoryOptions") {
            getFilterData("categories", "group", api.apiPath, api).then(({ objects }) =>
                setCategoryFilterData(objects)
            );
        }
    }, [api, model]);

    useEffect(() => {
        if (remoteInstance && isJSONDataSource(remoteInstance)) return;

        compositionRoot.responsibles.list(remoteInstance).then(updateResponsibles);
    }, [compositionRoot, remoteInstance]);

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { sorting, pagination, selection } = tableState;

        const included = _.reject(selection, { indeterminate: true }).map(({ id }) => id);
        const newlySelectedIds = _.difference(included, selectedIds);
        const newlyUnselectedIds = _.difference(selectedIds, included);

        const parseChildren = (ids: string[]) =>
            _(rows)
                .filter(({ id }) => !!ids.includes(id))
                .map(row => _.values(_.pick(row, childrenKeys)) as unknown as MetadataType)
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

        if (!_.isEqual(stateSelection, included)) {
            notifyNewSelection(included, excluded);
        }

        setStateSelection(included);
        updateFilters({
            order: sorting,
            page: pagination.page,
            pageSize: pagination.pageSize,
        });
    };

    const exclusion = excludedIds.map(id => ({ id }));
    const selection = selectedIds.map(id => ({
        id,
        checked: true,
        indeterminate: false,
    }));

    const childrenSelection: TableSelection[] = useMemo(
        () =>
            showIndeterminateSelection
                ? _(rows)
                      .intersectionBy(selection, "id")
                      .map(row => _.values(_.pick(row, childrenKeys)) as unknown as MetadataType[])
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
                : [],
        [childrenKeys, exclusion, rows, selection, showIndeterminateSelection]
    );

    const responsibleField = showResponsibles
        ? {
              name: "responsible",
              text: i18n.t("Custodian"),
              getValue: (row: MetadataType) => {
                  const { users = [], userGroups = [] } = responsibles.find(({ id }) => row.id === id) ?? {};

                  const results = [...users, ...userGroups].map(({ name }) => name);
                  return results.length === 0 ? "-" : results.join(", ");
              },
          }
        : undefined;

    const columns: TableColumn<MetadataType>[] = uniqCombine(
        _.compact([
            ...model.getColumns(),
            ...additionalColumns,
            responsibleField ? { ...responsibleField, sortable: false } : undefined,
        ])
    );

    const details: ObjectsTableDetailField<MetadataType>[] = uniqCombine([...model.getDetails(), responsibleField]);

    const actions: TableAction<MetadataType>[] = uniqCombine([...tableActions, ...additionalActions]);

    const uiSelection = useMemo(() => {
        return [...selection, ...childrenSelection];
    }, [childrenSelection, selection]);

    const shownRows = useMemo(() => (modelIsSyncAll ? [] : transformRows(rows)), [modelIsSyncAll, rows, transformRows]);

    return (
        <React.Fragment>
            <ResponsibleDialog
                entity={model.getCollectionName()}
                responsibles={responsibles}
                updateResponsibles={updateResponsibles}
                sharingSettingsElement={sharingSettingsElement}
                onClose={() => setSharingSettingsElement(undefined)}
            />

            <ObjectsTable<MetadataType>
                rows={shownRows}
                columns={columns}
                details={details}
                onChangeSearch={model.getMetadataType() !== "dataStore" ? changeSearchFilter : undefined}
                initialState={initialState}
                searchBoxLabel={i18n.t(`Search by name, code or id`)}
                pagination={pager}
                onChange={handleTableChange}
                ids={ids}
                loading={providedLoading || loading}
                selection={uiSelection}
                childrenKeys={childrenKeys}
                filterComponents={filterComponents}
                forceSelectionColumn={true}
                actions={actions}
                sideComponents={orgUnitTreeFilter}
                {...rest}
            />
        </React.Fragment>
    );
};

export default MetadataTable;
