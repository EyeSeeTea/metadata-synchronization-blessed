import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import { useD2, useD2Api } from "d2-api";
import { DatePicker, ReferenceObject, TableState } from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { ChangeEvent, useMemo, useState } from "react";
import i18n from "../../locales";
import { getOrgUnitSubtree } from "../../logic/metadata";
import { D2Model, DataElementModel } from "../../models/d2Model";
import { D2 } from "../../types/d2";
import { NamedRef } from "../../types/synchronization";
import { d2BaseModelFields, MetadataType } from "../../utils/d2";
import D2ObjectsTable, { D2ObjectsTableProps } from "../d2-objects-table/D2ObjectsTable";
import Dropdown from "../dropdown/Dropdown";
import { Params } from "d2-api/api/common";

interface MetadataTableProps extends Omit<D2ObjectsTableProps<MetadataType>, "columns" | "apiMethod"> {
    models: typeof D2Model[];
    selection?: string[];
    notifyNewSelection?(selection: string[]): void;
}

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
});

const MetadataTable: React.FC<MetadataTableProps> = ({
    models,
    selection = [],
    notifyNewSelection = _.noop,
    ...rest
}) => {
    const [lastUpdatedFilter, updateLastUpdatedFilter] = useState<Date | null>(null);
    const [onlySelectedFilter, updateOnlySelectedFilter] = useState<boolean>(false);
    const [model, updateModel] = useState<typeof D2Model>(() => DataElementModel);
    const d2 = useD2() as D2;
    const api = useD2Api();
    const classes = useStyles({});

    const changeDropdownFilter = (event: ChangeEvent<HTMLInputElement>) => {
        if (models.length === 0) throw new Error("You need to provide at least one model");
        const model =
            _.find(models, model => model.getMetadataType() === event.target.value) || models[0];
        updateModel(() => model);
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateOnlySelectedFilter(event.target.checked);
    };

    const handleTableChange = (tableState: TableState<ReferenceObject>) => {
        const { selection } = tableState;
        notifyNewSelection(selection);
    };

    const selectChildren = async (selectedOUs: NamedRef[]) => {
        const ids = new Set<string>();
        for (const selectedOU of selectedOUs) {
            const subtree = await getOrgUnitSubtree(d2 as D2, selectedOU.id);
            subtree.forEach(id => ids.add(id));
        }
        notifyNewSelection([...selection, ...Array.from(ids)]);
    };

    const groupTypes = models.map(model => ({
        id: model.getMetadataType(),
        name: model.getD2Model(d2).displayName,
    }));

    const apiQuery = useMemo(() => {
        const query: {
            [key: string]: any;
        } = {
            fields: model ? model.getFields() : d2BaseModelFields,
            filter: {
                lastUpdated: lastUpdatedFilter
                    ? { ge: moment(lastUpdatedFilter).format("YYYY-MM-DD") }
                    : undefined,
                id: onlySelectedFilter ? { in: selection } : undefined,
            },
        };

        query[model.getMetadataType()] = true;

        return query;
    }, [model, selection, lastUpdatedFilter, onlySelectedFilter]);

    const filterComponents = _.compact([
        models.length > 1 && (
            <Dropdown
                key={"level-filter"}
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
            value={lastUpdatedFilter}
            onChange={updateLastUpdatedFilter}
            isFilter
        />,
        <FormControlLabel
            key={"only-selected-filter"}
            className={classes.checkbox}
            control={
                <Checkbox
                    checked={onlySelectedFilter}
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
            onClick: selectChildren,
            icon: "done_all",
            isActive: () => {
                return model.getMetadataType() === "organisationUnit";
            },
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
            //@ts-ignore
            apiMethod={(params: Params) => model.getApiModel(api).get(params)}
            apiQuery={apiQuery}
            columns={model.getColumns()}
            details={model.getDetails()}
            filterComponents={filterComponents}
            forceSelectionColumn={true}
            actions={actions}
            selection={selection}
            onChange={handleTableChange}
            initialState={initialState}
            {...rest}
        />
    );
};

export default MetadataTable;
