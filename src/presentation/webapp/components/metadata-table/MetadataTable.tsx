import { Checkbox, FormControlLabel, Icon, makeStyles } from "@material-ui/core";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import axios from "axios";
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
} from "d2-ui-components";
import _ from "lodash";
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { NamedRef } from "../../../../domain/common/entities/Ref";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import { ListMetadataParams } from "../../../../domain/metadata/repositories/MetadataRepository";
import i18n from "../../../../locales";
import { D2Model } from "../../../../models/dhis/default";
import { DataElementModel } from "../../../../models/dhis/metadata";
import { MetadataType } from "../../../../utils/d2";
import { isAppConfigurator } from "../../../../utils/permissions";
import { useAppContext } from "../../../common/contexts/AppContext";
import Dropdown from "../dropdown/Dropdown";
import { ResponsibleDialog } from "../responsible-dialog/ResponsibleDialog";
import { getFilterData, getOrgUnitSubtree } from "./utils";

interface MetadataTableProps extends Omit<ObjectsTableProps<MetadataType>, "rows" | "columns"> {
    remoteInstance?: Instance;
    filterRows?: string[];
    transformRows?: (rows: MetadataType[]) => MetadataType[];
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
    allowChangingResponsible?: boolean;
    showOnlySelectedFilter?: boolean;
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
    allowChangingResponsible = false,
    showOnlySelectedFilter = true,
    ...rest
}) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();

    const snackbar = useSnackbar();

    const [model, updateModel] = useState<typeof D2Model>(() => models[0] ?? DataElementModel);
    const [ids, updateIds] = useState<string[]>([]);
    const [responsibles, updateResponsibles] = useState<MetadataResponsible[]>([]);
    const [sharingSettingsElement, setSharingSettingsElement] = useState<NamedRef>();

    const [selectedRows, setSelectedRows] = useState<string[]>(selectedIds);
    const [filters, setFilters] = useState<ListMetadataParams>({
        type: model.getCollectionName(),
        showOnlySelected: initialShowOnlySelected,
        order: initialState.sorting,
        page: initialState.pagination.page,
        pageSize: initialState.pagination.pageSize,
    });

    const updateFilters = React.useCallback(
        (partialFilters: Partial<ListMetadataParams>) => {
            setFilters(state => ({ ...state, page: 1, ...partialFilters }));
        },
        [setFilters]
    );

    const api = compositionRoot.instances.getApi(remoteInstance);

    const [expandOrgUnits, updateExpandOrgUnits] = useState<string[]>();
    const [groupFilterData, setGroupFilterData] = useState<NamedRef[]>([]);
    const [levelFilterData, setLevelFilterData] = useState<NamedRef[]>([]);
    const [appConfigurator, setAppConfigurator] = useState(false);

    const [rows, setRows] = useState<MetadataType[]>([]);
    const [pager, setPager] = useState<Partial<TablePagination>>({});
    const [loading, setLoading] = useState<boolean>(true);

    const showResponsibles =
        model.getCollectionName() === "dataSets" || model.getCollectionName() === "programs";

    const changeModelFilter = (modelName: string) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model = _.find(models, model => model.getMetadataType() === modelName) ?? models[0];
        updateModel(() => model);
        notifyNewModel(model);
        updateFilters({ type: model.getCollectionName() });
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

    const changeLevelFilter = (level: string) => {
        updateFilters({ level, parents: [] });
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        const showOnlySelected = event.target?.checked;
        updateFilters({
            selectedIds: showOnlySelected ? selectedRows : undefined,
            showOnlySelected,
        });
    };

    const changeParentOrgUnitFilter = React.useCallback(
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
            {models.length > 1 && (
                <div className={classes.metadataFilter}>
                    <Dropdown
                        items={models.map(model => ({
                            id: model.getMetadataType(),
                            name: model.getModelName(api),
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
                    value={filters.lastUpdated ?? null}
                    onChange={changeLastUpdatedFilter}
                    isFilter={true}
                />
            </div>

            {model.getGroupFilterName() && (
                <div className={classes.groupFilter}>
                    <Dropdown
                        items={groupFilterData}
                        onValueChange={changeGroupFilter}
                        value={filters.group?.value ?? ""}
                        label={i18n.t("{{displayName}} Group", {
                            displayName: model.getModelName(api),
                        })}
                    />
                </div>
            )}

            {model.getLevelFilterName() && (
                <div className={classes.levelFilter}>
                    <Dropdown
                        items={levelFilterData}
                        onValueChange={changeLevelFilter}
                        value={filters.level ?? ""}
                        label={i18n.t("{{displayName}} Level", {
                            displayName: model.getModelName(api),
                        })}
                    />
                </div>
            )}

            {showOnlySelectedFilter && (
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
            )}

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
                selected={filters.parents ?? []}
                singleSelection={true}
                selectOnClick={true}
                initiallyExpanded={expandOrgUnits}
            />
        </div>
    );

    const handleError = useCallback(
        (error: Error) => {
            if (!axios.isCancel(error)) {
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
            text: i18n.t("Set responsible users"),
            multiple: false,
            icon: <Icon>supervisor_account</Icon>,
            onClick: openResponsibleDialog,
            isActive: () => {
                return (
                    allowChangingResponsible &&
                    !remoteInstance &&
                    showResponsibles &&
                    appConfigurator
                );
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

        compositionRoot.metadata
            .listAll({ ...filters, filterRows, fields: { id: true } }, remoteInstance)
            .then(objects => {
                updateIds(objects.map(({ id }) => id));
            });
    }, [filters, filterRows, model, compositionRoot, remoteInstance]);

    useEffect(() => {
        if (model.getCollectionName() !== "organisationUnits") return;

        compositionRoot.instances
            .getOrgUnitRoots(remoteInstance)
            .then(roots => changeParentOrgUnitFilter(roots.map(({ path }) => path)))
            .catch(handleError);
    }, [compositionRoot, remoteInstance, model, handleError, changeParentOrgUnitFilter]);

    useEffect(() => {
        if (model.getCollectionName() === "organisationUnits" && !filters.parents) return;

        setLoading(true);
        compositionRoot.metadata
            .list({ ...filters, filterRows, fields: model.getFields() }, remoteInstance)
            .then(({ objects, pager }) => {
                const rows = model.getApiModelTransform()((objects as unknown) as MetadataType[]);
                notifyRowsChange(rows);

                setRows(rows);
                setPager(pager);
                setLoading(false);
            })
            .catch(handleError);
    }, [
        compositionRoot,
        notifyRowsChange,
        remoteInstance,
        filters,
        filterRows,
        model,
        handleError,
    ]);

    useEffect(() => {
        if (model && model.getGroupFilterName()) {
            getFilterData(
                model.getGroupFilterName(),
                "group",
                api.apiPath,
                api
            ).then(({ objects }) => setGroupFilterData(objects));
        }

        if (model && model.getLevelFilterName()) {
            getFilterData(model.getLevelFilterName(), "level", api.apiPath, api).then(
                ({ objects }) => {
                    setLevelFilterData(
                        objects.map(({ name, level }) => ({
                            id: String(level),
                            name: `${level}. ${name}`,
                        }))
                    );
                }
            );
        }
    }, [api, model]);

    useEffect(() => {
        compositionRoot.responsibles.list(remoteInstance).then(updateResponsibles);
    }, [compositionRoot, remoteInstance]);

    useEffect(() => {
        isAppConfigurator(api).then(setAppConfigurator);
    }, [api]);

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

        notifyNewSelection(included, excluded);
        setSelectedRows(included);
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

    const responsibleField = showResponsibles
        ? {
              name: "responsible",
              text: i18n.t("Responsible"),
              getValue: (row: MetadataType) => {
                  const { users = [], userGroups = [] } =
                      responsibles.find(({ id }) => row.id === id) ?? {};

                  const results = [...users, ...userGroups].map(({ name }) => name);
                  return results.length === 0 ? "-" : results.join(", ");
              },
          }
        : undefined;

    const columns: TableColumn<MetadataType>[] = uniqCombine([
        ...model.getColumns(),
        ...additionalColumns,
        { ...responsibleField, sortable: false },
    ]);

    const details: ObjectsTableDetailField<MetadataType>[] = uniqCombine([
        ...model.getDetails(),
        responsibleField,
    ]);

    const actions: TableAction<MetadataType>[] = uniqCombine([
        ...tableActions,
        ...additionalActions,
    ]);

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
                rows={transformRows(rows)}
                columns={columns}
                details={details}
                onChangeSearch={changeSearchFilter}
                initialState={initialState}
                searchBoxLabel={i18n.t(`Search by `) + model.getSearchFilter().field}
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
        </React.Fragment>
    );
};

(MetadataTable as any).whyDidYouRender = true;

export default MetadataTable;
