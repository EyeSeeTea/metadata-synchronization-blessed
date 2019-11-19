import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {
    D2DataElementGroupSchema,
    D2DataElementGroupSetSchema,
    D2DataElementSchema,
    D2DataSetSchema,
    D2ProgramSchema,
    SelectedPick,
    useD2Api,
} from "d2-api";
import D2ApiModel from "d2-api/api/models";
import { D2ObjectsTable, DatePicker, TableState } from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { ChangeEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";

const include = true as true;

const fields = {
    id: include,
    displayName: include,
    shortName: include,
    code: include,
    displayDescription: include,
    created: include,
    lastUpdated: include,
    href: include,
};

const columns = [
    { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
    { name: "lastUpdated" as const, text: i18n.t("Last update"), sortable: true },
    { name: "id" as const, text: i18n.t("UID"), sortable: true },
];

const details = [
    { name: "displayName" as const, text: i18n.t("Name") },
    { name: "shortName" as const, text: i18n.t("Short name") },
    { name: "code" as const, text: i18n.t("Code") },
    { name: "displayDescription" as const, text: i18n.t("Description") },
    { name: "created" as const, text: i18n.t("Created") },
    { name: "lastUpdated" as const, text: i18n.t("Last update") },
    { name: "id" as const, text: i18n.t("ID") },
    { name: "href" as const, text: i18n.t("API link") },
];

const actions = [{ name: "details", text: i18n.t("Details") }];

const initialState = {
    sorting: {
        field: "displayName" as const,
        order: "asc" as const,
    },
};

const useStyles = makeStyles({
    checkbox: {
        paddingLeft: 10,
        marginTop: 8,
    },
});

type DataElement = SelectedPick<D2DataElementSchema, typeof fields>;
type DataElementGroup = SelectedPick<D2DataElementGroupSchema, typeof fields>;
type DataElementGroupSet = SelectedPick<D2DataElementGroupSetSchema, typeof fields>;
type DataSet = SelectedPick<D2DataSetSchema, typeof fields>;
type Program = SelectedPick<D2ProgramSchema, typeof fields>;

type DataPageType = DataElement | DataElementGroup | DataElementGroupSet | DataSet | Program;

const DataPage: React.FC<any> = () => {
    const [modelName, changeModelName] = useState<string>("");
    const [selection, updateSelection] = useState<string[]>([]);
    const [lastUpdatedFilter, changeLastUpdatedFilter] = useState<Date | null>(null);
    const [onlySelectedFilter, changeOnlySelectedFilter] = useState<boolean>(false);
    const api = useD2Api();
    const history = useHistory();
    const classes = useStyles({});

    const groupTypes: {
        id: string;
        name: string;
        model: D2ApiModel<"dataElementGroups" | "dataElementGroupSets" | "dataSets" | "programs">;
    }[] = [
        {
            name: "Data Element Groups",
            model: api.models.dataElementGroups,
            id: "dataElementGroups",
        },
        {
            name: "Data Element Group Sets",
            model: api.models.dataElementGroupSets,
            id: "dataElementGroupSets",
        },
        { name: "Datasets", model: api.models.dataSets, id: "dataSets" },
        { name: "Programs", model: api.models.programs, id: "programs" },
    ];

    // @tokland I am not 100% sure how to infer the "Options" here without hardcoding it to one single model
    const apiMethod = (options: Parameters<typeof api.models.dataElements.get>[0]) => {
        const groupType = _.find(groupTypes, ["id", modelName]);
        return groupType ? groupType.model.get(options) : api.models.dataElements.get(options);
    };

    const updateDropdownFilter = (event: ChangeEvent<HTMLInputElement>) => {
        changeModelName(event.target.value);
    };

    const updateOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        changeOnlySelectedFilter(event.target.checked);
    };

    const filterComponents = [
        <Dropdown
            key={"level-filter"}
            items={groupTypes}
            onChange={updateDropdownFilter}
            value={modelName}
            label={i18n.t("Group by metadata type")}
        />,
        <DatePicker
            key={"date-filter"}
            placeholder={i18n.t("Last updated date")}
            value={lastUpdatedFilter}
            onChange={changeLastUpdatedFilter}
            isFilter
        />,
        <FormControlLabel
            key={"only-selected-filter"}
            className={classes.checkbox}
            control={
                <Checkbox
                    checked={onlySelectedFilter}
                    data-test="show-only-selected-items"
                    onChange={updateOnlySelectedFilter}
                />
            }
            label={i18n.t("Only selected items")}
        />,
    ];

    const apiQuery = {
        fields,
        filter: {
            lastUpdated: lastUpdatedFilter
                ? { ge: moment(lastUpdatedFilter).format("YYYY-MM-DD") }
                : undefined,
            // TODO: d2-api ignores empty array for "in" filter
            id: onlySelectedFilter ? { in: [...selection, ""] } : undefined,
        },
    };

    const goBack = () => history.goBack();

    const handleTableChange = (tableState: TableState<DataPageType>) => {
        const { selection } = tableState;
        updateSelection(selection);
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={goBack} title={i18n.t("Data synchronization")} />

            <D2ObjectsTable<DataPageType>
                apiMethod={apiMethod}
                apiQuery={apiQuery}
                columns={columns}
                filterComponents={filterComponents}
                forceSelectionColumn={true}
                details={details}
                actions={actions}
                selection={selection}
                onChange={handleTableChange}
                initialState={initialState}
            />
        </React.Fragment>
    );
};

export default DataPage;
