import { Typography } from "@material-ui/core";
import { ObjectsTable, ObjectsTableDetailField, TableColumn, TableState } from "d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../../../../locales";
import { SyncWizardStepProps } from "../Steps";
import { TrackedEntityInstance } from "../../../../../../domain/tracked-entity-instances/entities/TrackedEntityInstance";
import _ from "lodash";
import { SynchronizationRule } from "../../../../../../domain/rules/entities/SynchronizationRule";
import { Program } from "../../../../../../domain/metadata/entities/MetadataEntities";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";

interface TEIObject extends TrackedEntityInstance {
    id: string;
    [key: string]: any;
}

// const teisBU: TrackedEntityInstance[] = [
//     {
//         created: "2020-12-11T20:29:40.219",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2020-12-11T20:29:40.219",
//         trackedEntityInstance: "VIavaKsAbyZ",
//         lastUpdated: "2020-12-14T22:01:59.285",
//         trackedEntityType: "MCPQUTHX1Ze",
//         lastUpdatedAtClient: "2020-12-11T20:29:40.219",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2020-12-11T20:29:40.223",
//                 storedBy: "pablo.foche",
//                 code: "ATT_Gender",
//                 displayName: "Gender",
//                 created: "2020-12-11T20:29:40.223",
//                 valueType: "TEXT",
//                 attribute: "IW1EGccT7jT",
//                 value: "Op_Gender_Female",
//             },
//             {
//                 lastUpdated: "2020-12-11T20:29:40.225",
//                 storedBy: "pablo.foche",
//                 code: "At_CL_UniqueIdentifier",
//                 displayName: "CL Unique identifier",
//                 created: "2020-12-11T20:29:40.225",
//                 valueType: "TEXT",
//                 attribute: "ouKWo9RAz85",
//                 value: "testtest",
//             },
//             {
//                 lastUpdated: "2020-12-11T20:29:40.226",
//                 storedBy: "pablo.foche",
//                 code: "ATT_PID",
//                 displayName: "Patient ID",
//                 created: "2020-12-11T20:29:40.226",
//                 valueType: "TEXT",
//                 attribute: "sKBh0kazOCk",
//                 value: "87001",
//             },
//         ],
//     },
//     {
//         created: "2020-11-25T17:58:46.297",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2020-11-25T17:58:46.297",
//         trackedEntityInstance: "hCsSHY5mBXF",
//         lastUpdated: "2020-12-01T12:44:18.603",
//         trackedEntityType: "MCPQUTHX1Ze",
//         lastUpdatedAtClient: "2020-11-25T17:58:46.297",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2020-11-25T17:58:46.312",
//                 storedBy: "pablo.foche",
//                 code: "ATT_PID",
//                 displayName: "Patient ID",
//                 created: "2020-11-25T17:58:46.312",
//                 valueType: "TEXT",
//                 attribute: "sKBh0kazOCk",
//                 value: "27964",
//             },
//             {
//                 lastUpdated: "2020-11-25T17:58:46.312",
//                 storedBy: "pablo.foche",
//                 code: "At_VillageName",
//                 displayName: "Village name",
//                 created: "2020-11-25T17:58:46.311",
//                 valueType: "TEXT",
//                 attribute: "jNdayul1eZ8",
//                 value: "dasfs",
//             },
//             {
//                 lastUpdated: "2020-11-25T17:58:46.300",
//                 storedBy: "pablo.foche",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2020-11-25T17:58:46.299",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "testing",
//             },
//             {
//                 lastUpdated: "2020-11-25T17:58:46.309",
//                 storedBy: "pablo.foche",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2020-11-25T17:58:46.309",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "2002-11-08",
//             },
//             {
//                 lastUpdated: "2020-11-25T17:58:46.312",
//                 storedBy: "pablo.foche",
//                 code: "At_CL_UniqueIdentifier",
//                 displayName: "CL Unique identifier",
//                 created: "2020-11-25T17:58:46.312",
//                 valueType: "TEXT",
//                 attribute: "ouKWo9RAz85",
//                 value: "testttt",
//             },
//             {
//                 lastUpdated: "2020-11-25T17:58:46.300",
//                 storedBy: "pablo.foche",
//                 code: "ATT_Gender",
//                 displayName: "Gender",
//                 created: "2020-11-25T17:58:46.300",
//                 valueType: "TEXT",
//                 attribute: "IW1EGccT7jT",
//                 value: "Op_Gender_Male",
//             },
//         ],
//     },
//     {
//         created: "2020-11-20T12:52:52.841",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2020-11-20T12:52:52.841",
//         trackedEntityInstance: "MDLxL31N1xn",
//         lastUpdated: "2020-11-26T16:56:07.724",
//         trackedEntityType: "MCPQUTHX1Ze",
//         lastUpdatedAtClient: "2020-11-20T12:52:52.841",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2020-11-20T16:03:41.981",
//                 storedBy: "pablo.foche",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2020-11-20T12:52:52.845",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "1900-11-19",
//             },
//             {
//                 lastUpdated: "2020-11-20T12:52:52.843",
//                 storedBy: "pablo.foche",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2020-11-20T12:52:52.843",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "test",
//             },
//             {
//                 lastUpdated: "2020-11-20T12:52:52.845",
//                 storedBy: "pablo.foche",
//                 code: "ATT_PID",
//                 displayName: "Patient ID",
//                 created: "2020-11-20T12:52:52.845",
//                 valueType: "TEXT",
//                 attribute: "sKBh0kazOCk",
//                 value: "77373",
//             },
//             {
//                 lastUpdated: "2020-11-20T12:52:52.845",
//                 storedBy: "pablo.foche",
//                 code: "At_CL_UniqueIdentifier",
//                 displayName: "CL Unique identifier",
//                 created: "2020-11-20T12:52:52.845",
//                 valueType: "TEXT",
//                 attribute: "ouKWo9RAz85",
//                 value: "1321654",
//             },
//             {
//                 lastUpdated: "2020-11-20T16:00:31.085",
//                 storedBy: "pablo.foche",
//                 code: "ATT_Gender",
//                 displayName: "Gender",
//                 created: "2020-11-20T12:52:52.844",
//                 valueType: "TEXT",
//                 attribute: "IW1EGccT7jT",
//                 value: "Op_Gender_Male",
//             },
//         ],
//     },
// ];

// const teisCovid: TrackedEntityInstance[] = [
//     {
//         created: "2021-01-27T01:27:39.490",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-27T01:27:39.490",
//         trackedEntityInstance: "UwczRR2gMqO",
//         lastUpdated: "2021-01-27T01:29:19.156",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-27T01:27:39.490",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-27T01:27:39.507",
//                 storedBy: "ignacio.foche",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-27T01:27:39.507",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "F",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:27:39.514",
//                 storedBy: "ignacio.foche",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2021-01-27T01:27:39.514",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "2021-01-12",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:27:39.512",
//                 storedBy: "ignacio.foche",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-27T01:27:39.507",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "123512354",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:27:39.502",
//                 storedBy: "ignacio.foche",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-27T01:27:39.498",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "test1",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:27:39.505",
//                 storedBy: "ignacio.foche",
//                 code: "surname",
//                 displayName: "Surname",
//                 created: "2021-01-27T01:27:39.505",
//                 valueType: "TEXT",
//                 attribute: "ENRjVGxVL6l",
//                 value: "test1",
//             },
//         ],
//     },
//     {
//         created: "2021-01-27T01:11:21.329",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-27T01:11:21.329",
//         trackedEntityInstance: "MEuOLzskIQK",
//         lastUpdated: "2021-01-27T01:14:16.640",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-27T01:11:21.329",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-27T01:11:21.344",
//                 storedBy: "ignacio.foche",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-27T01:11:21.344",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "F",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:11:21.353",
//                 storedBy: "ignacio.foche",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2021-01-27T01:11:21.353",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "2021-01-20",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:11:21.338",
//                 storedBy: "ignacio.foche",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-27T01:11:21.335",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "test",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:11:21.350",
//                 storedBy: "ignacio.foche",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-27T01:11:21.345",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "1234153",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:11:21.359",
//                 storedBy: "ignacio.foche",
//                 displayName: "COVID19_AreaResidence",
//                 created: "2021-01-27T01:11:21.358",
//                 valueType: "TEXT",
//                 attribute: "Yvd3IWU5alG",
//                 value: "ALB",
//             },
//             {
//                 lastUpdated: "2021-01-27T01:11:21.342",
//                 storedBy: "ignacio.foche",
//                 code: "surname",
//                 displayName: "Surname",
//                 created: "2021-01-27T01:11:21.342",
//                 valueType: "TEXT",
//                 attribute: "ENRjVGxVL6l",
//                 value: "test",
//             },
//         ],
//     },
//     {
//         created: "2021-01-12T09:28:20.173",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-12T09:28:20.173",
//         trackedEntityInstance: "q9cGrjC8ixO",
//         lastUpdated: "2021-01-26T17:43:16.275",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-12T09:28:20.173",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-12T09:28:20.195",
//                 storedBy: "luisa",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2021-01-12T09:28:20.195",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "1939-01-19",
//             },
//             {
//                 lastUpdated: "2021-01-12T09:28:20.187",
//                 storedBy: "luisa",
//                 code: "surname",
//                 displayName: "Surname",
//                 created: "2021-01-12T09:28:20.187",
//                 valueType: "TEXT",
//                 attribute: "ENRjVGxVL6l",
//                 value: "X",
//             },
//             {
//                 lastUpdated: "2021-01-12T09:28:20.192",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-12T09:28:20.191",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "6548121",
//             },
//             {
//                 lastUpdated: "2021-01-12T09:28:20.189",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-12T09:28:20.189",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "F",
//             },
//             {
//                 lastUpdated: "2021-01-12T09:28:20.184",
//                 storedBy: "luisa",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-12T09:28:20.181",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "pacient",
//             },
//         ],
//     },
//     {
//         created: "2021-01-26T14:24:48.194",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-26T14:24:48.194",
//         trackedEntityInstance: "uUqe4SZCsM1",
//         lastUpdated: "2021-01-26T17:36:43.703",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-26T14:24:48.194",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-26T14:24:48.199",
//                 storedBy: "luisa",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-26T14:24:48.199",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "Paco",
//             },
//             {
//                 lastUpdated: "2021-01-26T14:24:48.200",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-26T14:24:48.200",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "M",
//             },
//             {
//                 lastUpdated: "2021-01-26T14:24:48.203",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-26T14:24:48.202",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "988787",
//             },
//         ],
//     },
//     {
//         created: "2021-01-12T11:54:26.065",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-12T11:54:26.065",
//         trackedEntityInstance: "CRb8uALKqe7",
//         lastUpdated: "2021-01-26T12:26:46.798",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-12T11:54:26.065",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-12T11:54:26.078",
//                 storedBy: "luisa",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2021-01-12T11:54:26.078",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "1964-01-22",
//             },
//             {
//                 lastUpdated: "2021-01-12T11:54:26.076",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-12T11:54:26.076",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "55555",
//             },
//             {
//                 lastUpdated: "2021-01-12T11:54:26.073",
//                 storedBy: "luisa",
//                 code: "surname",
//                 displayName: "Surname",
//                 created: "2021-01-12T11:54:26.073",
//                 valueType: "TEXT",
//                 attribute: "ENRjVGxVL6l",
//                 value: "hghghg",
//             },
//             {
//                 lastUpdated: "2021-01-12T11:54:26.071",
//                 storedBy: "luisa",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-12T11:54:26.071",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "jgjhghjgjg",
//             },
//             {
//                 lastUpdated: "2021-01-12T11:54:26.075",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-12T11:54:26.075",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "M",
//             },
//         ],
//     },
//     {
//         created: "2021-01-08T17:06:19.367",
//         orgUnit: "H8RixfF8ugH",
//         createdAtClient: "2021-01-08T17:06:19.367",
//         trackedEntityInstance: "V71htG7TeGI",
//         lastUpdated: "2021-01-08T17:06:19.515",
//         trackedEntityType: "w39Ie6Z5XNw",
//         lastUpdatedAtClient: "2021-01-08T17:06:19.367",
//         inactive: false,
//         deleted: false,
//         featureType: "NONE",
//         programOwners: [],
//         enrollments: [],
//         relationships: [],
//         attributes: [
//             {
//                 lastUpdated: "2021-01-08T17:06:19.374",
//                 storedBy: "luisa",
//                 code: "At_Age_Agetype",
//                 displayName: "Age",
//                 created: "2021-01-08T17:06:19.374",
//                 valueType: "AGE",
//                 attribute: "QsZzvWDmapr",
//                 value: "2004-01-31",
//             },
//             {
//                 lastUpdated: "2021-01-08T17:06:19.370",
//                 storedBy: "luisa",
//                 code: "At_FirstName",
//                 displayName: "First name",
//                 created: "2021-01-08T17:06:19.370",
//                 valueType: "TEXT",
//                 attribute: "DwZNiXy5Daz",
//                 value: "PPPPPP",
//             },
//             {
//                 lastUpdated: "2021-01-08T17:06:19.373",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Patient ID",
//                 created: "2021-01-08T17:06:19.373",
//                 valueType: "INTEGER_POSITIVE",
//                 attribute: "HkBG3DVELBM",
//                 value: "888888",
//             },
//             {
//                 lastUpdated: "2021-01-08T17:06:19.372",
//                 storedBy: "luisa",
//                 displayName: "COVID19_Sex",
//                 created: "2021-01-08T17:06:19.372",
//                 valueType: "TEXT",
//                 attribute: "G3vz3y2lX1b",
//                 value: "M",
//             },
//             {
//                 lastUpdated: "2021-01-08T17:06:19.372",
//                 storedBy: "luisa",
//                 code: "surname",
//                 displayName: "Surname",
//                 created: "2021-01-08T17:06:19.371",
//                 valueType: "TEXT",
//                 attribute: "ENRjVGxVL6l",
//                 value: "uuuuu",
//             },
//         ],
//     },
// ];

export default function TEIsSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const { compositionRoot } = useAppContext();

    const [memoizedSyncRule] = useState<SynchronizationRule>(syncRule);
    const [rows, setRows] = useState<TEIObject[]>([]);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [programFilter, setProgramFilter] = useState<string>("");
    const [error, setError] = useState<unknown>();

    useEffect(() => {
        const sync = compositionRoot.sync.events(memoizedSyncRule.toBuilder());
        sync.extractMetadata<Program>().then(({ programs = [] }) => setPrograms(programs));
    }, [memoizedSyncRule, compositionRoot]);

    useEffect(() => {
        if (programs.length === 1) {
            setProgramFilter(programs[0].id);
        }
    }, [compositionRoot, memoizedSyncRule, programs]);

    useEffect(() => {
        if (programFilter) {
            compositionRoot.teis
                .list(
                    {
                        ...memoizedSyncRule.dataParams,
                        allEvents: true,
                    },
                    programFilter
                )
                .then(teis => setRows(teis.map(tei => ({ ...tei, id: tei.trackedEntityInstance }))))
                .catch(setError);

            // const teis = programFilter === "lAu94BiaY5s" ? teisBU : teisCovid;
            // setRows(teis.map(tei => ({ ...tei, id: tei.trackedEntityInstance })));
        } else {
            setRows([]);
        }
    }, [compositionRoot, programFilter, memoizedSyncRule]);

    const handleTableChange = useCallback(
        (tableState: TableState<TEIObject>) => {
            const { selection } = tableState;
            onChange(syncRule.updateDataSyncTEIs(selection.map(({ id }) => id)));
        },
        [onChange, syncRule]
    );

    const excludeTeiRelationships = useCallback(
        (value: boolean) => {
            onChange(syncRule.updateExcludeTeiRelationships(value));
        },
        [onChange, syncRule]
    );

    const addToSelection = useCallback(
        (ids: string[]) => {
            const oldSelection = _.difference(syncRule.dataSyncTeis, ids);
            const newSelection = _.difference(ids, syncRule.dataSyncTeis);

            onChange(syncRule.updateDataSyncTEIs([...oldSelection, ...newSelection]));
        },
        [onChange, syncRule]
    );

    const attributes = useMemo(
        () =>
            _(
                rows
                    .map(tei =>
                        tei.attributes.map(att => ({
                            attribute: att.attribute,
                            displayName: att.displayName,
                        }))
                    )
                    .flat()
            )
                .uniqBy("attribute")
                .value(),
        [rows]
    );

    const columns: TableColumn<TEIObject>[] = useMemo(
        () => [
            { name: "id" as const, text: i18n.t("UID"), sortable: true },
            ...attributes.map(columnAtt => {
                return {
                    name: columnAtt.attribute,
                    text: columnAtt.displayName,
                    sortable: true,
                    getValue: (tei: TrackedEntityInstance) =>
                        tei.attributes.find(att => att.attribute === columnAtt.attribute)?.value ||
                        "",
                };
            }),
        ],
        [attributes]
    );

    const details: ObjectsTableDetailField<TEIObject>[] = useMemo(
        () => [
            { name: "id" as const, text: i18n.t("UID") },
            ...attributes.map(columnAtt => {
                return {
                    name: columnAtt.attribute,
                    text: columnAtt.displayName,
                    getValue: (tei: TrackedEntityInstance) =>
                        tei.attributes.find(att => att.attribute === columnAtt.attribute)?.value ||
                        "",
                };
            }),
        ],
        [attributes]
    );

    const actions = useMemo(
        () => [
            {
                name: "select",
                text: i18n.t("Select"),
                primary: true,
                multiple: true,
                onClick: addToSelection,
                isActive: () => false,
            },
        ],
        [addToSelection]
    );

    const filterComponents = useMemo(
        () => (
            <Dropdown
                key={"program-filter"}
                items={programs}
                onValueChange={setProgramFilter}
                value={programFilter}
                label={i18n.t("Program")}
            />
        ),
        [programFilter, programs]
    );

    if (error) {
        console.error(error);
        return (
            <Typography>
                {i18n.t("An error ocurred while trying to access the required events")}
            </Typography>
        );
    }

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Exclude relationships")}
                value={syncRule.excludeTeiRelationships}
                onValueChange={excludeTeiRelationships}
            />
            {!syncRule.dataSyncAllEvents && (
                <ObjectsTable<TEIObject>
                    rows={rows}
                    loading={rows === undefined}
                    columns={columns}
                    details={details}
                    actions={actions}
                    forceSelectionColumn={true}
                    onChange={handleTableChange}
                    selection={syncRule.dataSyncTeis?.map(id => ({ id })) ?? []}
                    filterComponents={filterComponents}
                />
            )}
        </React.Fragment>
    );
}
