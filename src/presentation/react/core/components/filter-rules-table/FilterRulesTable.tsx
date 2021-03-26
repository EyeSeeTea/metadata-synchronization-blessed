import { Button, Icon } from "@material-ui/core";
import {
    ObjectsTable,
    PaginationOptions,
    TableAction,
    TableColumn,
    TableSelection,
    TableState,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { updateObject as updateObjectInList } from "../../../../../domain/common/entities/Ref";
import {
    FilterRule,
    getDateFilterString,
    getInitialFilterRule,
    getStringMatchString,
} from "../../../../../domain/metadata/entities/FilterRule";
import i18n from "../../../../../locales";
import { metadataModels } from "../../../../../models/dhis/factory";
import { useOpenState } from "../../hooks/useOpenState";
import { FilterRuleDialog, NewFilterRuleDialogProps } from "./FilterRuleDialog";

export interface FilterRulesTableProps {
    filterRules: FilterRule[];
    onChange: (filterRules: FilterRule[]) => void;
}

type Action = { type: "new" | "edit"; filterRule: FilterRule };

const FilterRulesTable: React.FC<FilterRulesTableProps> = props => {
    const { filterRules, onChange } = props;
    const [selection, updateSelection] = useState<TableSelection[]>([]);
    const newFilterRuleDialog = useOpenState<Action>();

    const modelNames = useMemo(() => {
        return _(metadataModels)
            .map(model => [model.getMetadataType(), model.getModelName()] as [string, string])
            .fromPairs()
            .value();
    }, []);

    const editRule = useCallback(
        (ids: string[]) => {
            const filterRule = _.find(filterRules, ({ id }) => id === ids[0]);
            if (filterRule) newFilterRuleDialog.open({ type: "edit", filterRule });
        },
        [filterRules, newFilterRuleDialog]
    );

    const deleteRule = useCallback(
        async (ids: string[]) => {
            const newFilterRules = filterRules.filter(filterRule => !ids.includes(filterRule.id));
            onChange(newFilterRules);
            updateSelection([]);
        },
        [filterRules, onChange]
    );

    const updateTable = useCallback(
        ({ selection }: TableState<FilterRule>) => {
            updateSelection(selection);
        },
        [updateSelection]
    );

    const columns: TableColumn<FilterRule>[] = useMemo(
        () => [
            {
                name: "metadataType",
                text: i18n.t("Metadata type"),
                getValue: rule => modelNames[rule.metadataType] || "-",
            },
            {
                name: "created",
                text: i18n.t("Created"),
                getValue: rule => getDateFilterString(rule.created),
            },
            {
                name: "lastUpdated",
                text: i18n.t("Last updated"),
                getValue: rule => getDateFilterString(rule.lastUpdated),
            },
            {
                name: "stringMatch",
                text: i18n.t("Name/code/description"),
                getValue: rule => getStringMatchString(rule.stringMatch) || "-",
            },
        ],
        [modelNames]
    );

    const actions: TableAction<FilterRule>[] = useMemo(
        () => [
            {
                name: "edit",
                text: i18n.t("Edit"),
                multiple: false,
                onClick: editRule,
                icon: <Icon>edit</Icon>,
            },
            {
                name: "delete",
                text: i18n.t("Delete"),
                multiple: true,
                onClick: deleteRule,
                icon: <Icon>delete</Icon>,
            },
        ],
        [deleteRule, editRule]
    );

    const openNewDialog = useCallback(() => {
        const newFilterRule = { type: "new" as const, filterRule: getInitialFilterRule() };
        newFilterRuleDialog.open(newFilterRule);
    }, [newFilterRuleDialog]);

    const extraComponents = (
        <Button variant="contained" color="primary" onClick={openNewDialog}>
            {i18n.t("Create new filter")}
        </Button>
    );

    const { close: closeFilterRuleDialog } = newFilterRuleDialog;
    const save = useCallback<NewFilterRuleDialogProps["onSave"]>(
        filterRule => {
            const newFilterRules = updateObjectInList(filterRules, filterRule);
            onChange(newFilterRules);
            closeFilterRuleDialog();
        },
        [filterRules, onChange, closeFilterRuleDialog]
    );

    return (
        <React.Fragment>
            <ObjectsTable<FilterRule>
                rows={filterRules}
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
