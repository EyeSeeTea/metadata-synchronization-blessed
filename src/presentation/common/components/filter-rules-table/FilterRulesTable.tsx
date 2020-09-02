import { Icon, Button } from "@material-ui/core";
import {
    ObjectsTable,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
    PaginationOptions,
} from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import i18n from "../../../../locales";
import {
    FilterRule,
    getDateFilterString,
    getInitialFilterRule,
    whereNames,
} from "../../../../domain/metadata/entities/FilterRule";
import { FilterRuleDialog, NewFilterRuleDialogProps } from "./FilterRuleDialog";
import { updateObject as updateObjectInList } from "../../../../domain/common/entities/Ref";

interface FilterRuleRow {
    id: string;
    type: FilterRule["type"];
    created: string;
    lastUpdated: string;
    value: string;
}

function getFilterRuleRow(filterRule: FilterRule): FilterRuleRow {
    const base = {
        id: filterRule.id,
        type: filterRule.type,
        created: "",
        lastUpdated: "",
        value: "",
    };

    switch (filterRule.type) {
        case "created":
            return { ...base, created: getDateFilterString(filterRule.value) };
        case "lastUpdated":
            return { ...base, lastUpdated: getDateFilterString(filterRule.value) };
        case "stringMatch": {
            const where = whereNames[filterRule.where];
            const strValue = _.truncate(filterRule.value, { length: 40 });
            return { ...base, value: `${where} '${strValue}'` };
        }
        case "metadataType":
            return { ...base, value: filterRule.value };
    }
}

function useOpenState<Value>(initialValue?: Value) {
    const [value, setValue] = React.useState<Value | undefined>(initialValue);
    const open = React.useCallback((value: Value) => setValue(value), [setValue]);
    const close = React.useCallback(() => setValue(undefined), [setValue]);
    const isOpen = !!value;

    return { isOpen, value, open, close };
}

export interface FilterRulesTableProps {
    filterRules: FilterRule[];
    onChange: (filterRules: FilterRule[]) => void;
}

type Action = { type: "new" | "edit"; filterRule: FilterRule };

const FilterRulesTable: React.FC<FilterRulesTableProps> = props => {
    const { filterRules, onChange } = props;
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const newFilterRuleDialog = useOpenState<Action>();

    const edit = useCallback(
        (ids: string[]) => {
            const filterRule = _.find(filterRules, ({ id }) => id === ids[0]);
            if (filterRule) newFilterRuleDialog.open({ type: "edit", filterRule });
        },
        [filterRules, newFilterRuleDialog]
    );

    const remove = useCallback(
        async (ids: string[]) => {
            const newFilterRules = filterRules.filter(filterRule => ids.includes(filterRule.id));
            onChange(newFilterRules);
            updateSelection([]);
        },
        [filterRules, onChange]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<FilterRuleRow>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const columns: TableColumn<FilterRuleRow>[] = useMemo(
        () => [
            { name: "type", text: i18n.t("Type"), sortable: true },
            { name: "created", text: i18n.t("Created") },
            { name: "lastUpdated", text: i18n.t("Last updated") },
            { name: "value", text: i18n.t("Value") },
        ],
        []
    );

    const actions: TableAction<FilterRuleRow>[] = useMemo(
        () => [
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                onClick: edit,
                icon: <Icon>edit</Icon>,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: remove,
                icon: <Icon>delete</Icon>,
            },
        ],
        [remove, edit]
    );

    const openNewDialog = React.useCallback(() => {
        const newFilterRule = { type: "new" as const, filterRule: getInitialFilterRule("created") };
        newFilterRuleDialog.open(newFilterRule);
    }, [newFilterRuleDialog]);

    const extraComponents = (
        <Button variant="contained" color="primary" onClick={openNewDialog}>
            {i18n.t("Create new filter")}
        </Button>
    );

    const rows = React.useMemo(() => {
        return filterRules.map(getFilterRuleRow);
    }, [filterRules]);

    const { close: closeFilterRuleDialog } = newFilterRuleDialog;
    const save = React.useCallback<NewFilterRuleDialogProps["onSave"]>(
        filterRule => {
            const newFilterRules = updateObjectInList(filterRules, filterRule);
            onChange(newFilterRules);
            closeFilterRuleDialog();
        },
        [filterRules, onChange, closeFilterRuleDialog]
    );

    return (
        <React.Fragment>
            <ObjectsTable<FilterRuleRow>
                rows={rows}
                columns={columns}
                actions={actions}
                filterComponents={extraComponents}
                selection={selection}
                onChange={updateTable}
                paginationOptions={paginationOptions}
            />

            {newFilterRuleDialog.value && (
                <FilterRuleDialog
                    action={newFilterRuleDialog.value.type}
                    initialFilterRule={newFilterRuleDialog.value.filterRule}
                    onClose={newFilterRuleDialog.close}
                    onSave={save}
                />
            )}
        </React.Fragment>
    );
};

const paginationOptions: PaginationOptions = {
    pageSizeOptions: [10],
    pageSizeInitialValue: 10,
};

export default React.memo(FilterRulesTable);
