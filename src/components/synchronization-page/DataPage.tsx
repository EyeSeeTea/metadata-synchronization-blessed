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
import { D2ObjectsTable } from "d2-ui-components";
import _ from "lodash";
import React, { ChangeEvent, useState } from "react";
import Dropdown from "../dropdown/Dropdown";

const include = true as true;

const fields = {
    id: include,
    displayName: include,
    lastUpdated: include,
};

const columns = [
    { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
    { name: "lastUpdated" as const, text: i18n.t("Last update"), sortable: true },
    { name: "id" as const, text: i18n.t("UID"), sortable: true },
];

type DataElement = SelectedPick<D2DataElementSchema, typeof fields>;
type DataElementGroup = SelectedPick<D2DataElementGroupSchema, typeof fields>;
type DataElementGroupSet = SelectedPick<D2DataElementGroupSetSchema, typeof fields>;
type DataSet = SelectedPick<D2DataSetSchema, typeof fields>;
type Program = SelectedPick<D2ProgramSchema, typeof fields>;

type DataPageType = DataElement | DataElementGroup | DataElementGroupSet | DataSet | Program;

const DataPage: React.FC<any> = () => {
    const api = useD2Api();
    const [modelName, changeModelName] = useState<string>("");

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

    const filterComponents = (
        <Dropdown
            key={"level-filter"}
            items={groupTypes}
            onChange={updateDropdownFilter}
            value={modelName}
            label={i18n.t("Group by metadata type")}
        />
    );

    return (
        <D2ObjectsTable<DataPageType>
            apiMethod={apiMethod}
            fields={fields}
            columns={columns}
            filterComponents={filterComponents}
        />
    );
};

export default DataPage;
