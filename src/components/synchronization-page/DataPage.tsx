import i18n from "@dhis2/d2-i18n";
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
import { D2ObjectsTable, DatePicker } from "d2-ui-components";
import _ from "lodash";
import React, { ChangeEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../dropdown/Dropdown";
import PageHeader from "../page-header/PageHeader";
import moment from "moment";

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

type DataElement = SelectedPick<D2DataElementSchema, typeof fields>;
type DataElementGroup = SelectedPick<D2DataElementGroupSchema, typeof fields>;
type DataElementGroupSet = SelectedPick<D2DataElementGroupSetSchema, typeof fields>;
type DataSet = SelectedPick<D2DataSetSchema, typeof fields>;
type Program = SelectedPick<D2ProgramSchema, typeof fields>;

type DataPageType = DataElement | DataElementGroup | DataElementGroupSet | DataSet | Program;

const DataPage: React.FC<any> = () => {
    const [modelName, changeModelName] = useState<string>("");
    const [lastUpdatedFilter, changeLastUpdatedFilter] = useState<Date | null>(null);
    const api = useD2Api();
    const history = useHistory();

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
    ];

    const apiQuery = {
        fields,
        filter: {
            lastUpdated: lastUpdatedFilter
                ? { ge: moment(lastUpdatedFilter).format("YYYY-MM-DD") }
                : undefined,
        },
    };

    const goBack = () => history.goBack();

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
            />
        </React.Fragment>
    );
};

export default DataPage;
