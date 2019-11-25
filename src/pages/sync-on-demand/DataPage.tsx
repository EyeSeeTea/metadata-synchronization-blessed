import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import SyncIcon from "@material-ui/icons/Sync";
import {
    D2DataElementGroupSchema,
    D2DataElementGroupSetSchema,
    D2DataElementSchema,
    SelectedPick,
    useD2,
    useD2Api,
} from "d2-api";
import D2ApiModel from "d2-api/api/models";
import { D2ObjectsTable, DatePicker, TableState, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import moment from "moment";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Dropdown from "../../components/dropdown/Dropdown";
import PageHeader from "../../components/page-header/PageHeader";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import commonStepsBaseInfo from "../../components/sync-wizard/common/CommonStepsBaseInfo";
import SyncWizardDialog from "../../components/sync-wizard/common/SyncWizardDialog";
import CategoryOptionsSelectionStep from "../../components/sync-wizard/data/steps/CategoryOptionsSelectionStep";
import OrganisationUnitsSelectionStep from "../../components/sync-wizard/data/steps/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "../../components/sync-wizard/data/steps/PeriodSelectionStep";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2 } from "../../types/d2";
import { isAppConfigurator } from "../../utils/permissions";

const include = true as true;

const fields = {
    id: include,
    displayName: include,
    shortName: include,
    code: include,
    description: include,
    created: include,
    lastUpdated: include,
    href: include,
};

const dataElementGroupFields = {
    ...fields,
    dataElements: fields,
};

const dataElementGroupSetFields = {
    ...fields,
    dataElementGroups: {
        ...fields,
        dataElements: fields,
    },
};

const columns = [
    { name: "displayName" as const, text: i18n.t("Name"), sortable: true },
    { name: "lastUpdated" as const, text: i18n.t("Last updated"), sortable: true },
    { name: "id" as const, text: i18n.t("UID"), sortable: true },
];

const details = [
    { name: "displayName" as const, text: i18n.t("Name") },
    { name: "shortName" as const, text: i18n.t("Short name") },
    { name: "code" as const, text: i18n.t("Code") },
    { name: "description" as const, text: i18n.t("Description") },
    { name: "created" as const, text: i18n.t("Created") },
    { name: "lastUpdated" as const, text: i18n.t("Last updated") },
    { name: "id" as const, text: i18n.t("ID") },
    { name: "href" as const, text: i18n.t("API link") },
];

const actions = [{ name: "details", text: i18n.t("Details") }];

const stepsBaseInfo = [
    {
        key: "organisations-units",
        label: i18n.t("Organisation units"),
        component: OrganisationUnitsSelectionStep,
        validationKeys: ["organisationUnits"],
        description: undefined,
        help: undefined,
    },
    {
        key: "period",
        label: i18n.t("Period"),
        component: PeriodSelectionStep,
        validationKeys: ["period"],
        description: undefined,
        help: undefined,
    },
    {
        key: "category-options",
        label: i18n.t("Category options"),
        component: CategoryOptionsSelectionStep,
        validationKeys: ["categoryOptionIds"],
        description: undefined,
        help: undefined,
    },
    commonStepsBaseInfo.instanceSelection,
];

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
type DataElementGroup = SelectedPick<D2DataElementGroupSchema, typeof dataElementGroupFields>;
type DataElementGroupSet = SelectedPick<
    D2DataElementGroupSetSchema,
    typeof dataElementGroupSetFields
>;
type DataPageType = DataElement | DataElementGroup | DataElementGroupSet;

const DataPage: React.FC<any> = () => {
    const [modelName, updateModelName] = useState<string>("");
    const [lastUpdatedFilter, updateLastUpdatedFilter] = useState<Date | null>(null);
    const [onlySelectedFilter, updateOnlySelectedFilter] = useState<boolean>(false);
    const [syncRule, updateSyncRule] = useState<SyncRule>(SyncRule.createOnDemand("data"));
    const [appConfigurator, updateAppConfigurator] = useState(false);

    const [state, setState] = useState({
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
        enableDialogSync: false,
    });

    const snackbar = useSnackbar();
    const api = useD2Api();
    const d2 = useD2();
    const history = useHistory();
    const classes = useStyles({});
    const title = i18n.t("Data synchronization");

    useEffect(() => {
        isAppConfigurator(d2 as D2).then(updateAppConfigurator);
    }, [d2, updateAppConfigurator]);

    const groupTypes: {
        id: string;
        name: string;
        model: D2ApiModel<"dataElementGroups" | "dataElementGroupSets">;
        fields: any; // TODO: Not sure how to properly type this
    }[] = [
        {
            name: "Data Element Groups",
            model: api.models.dataElementGroups,
            id: "dataElementGroups",
            fields: dataElementGroupFields,
        },
        {
            name: "Data Element Group Sets",
            model: api.models.dataElementGroupSets,
            id: "dataElementGroupSets",
            fields: dataElementGroupSetFields,
        },
    ];

    const groupType = _.find(groupTypes, ["id", modelName]);

    // @tokland I am not 100% sure how to infer the "Options" here without hardcoding it to one single model
    const apiMethod = (options: Parameters<typeof api.models.dataElements.get>[0]) => {
        return groupType ? groupType.model.get(options) : api.models.dataElements.get(options);
    };

    const changeDropdownFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateModelName(event.target.value);
    };

    const changeOnlySelectedFilter = (event: ChangeEvent<HTMLInputElement>) => {
        updateOnlySelectedFilter(event.target.checked);
    };

    const filterComponents = [
        <Dropdown
            key={"level-filter"}
            items={groupTypes}
            onChange={changeDropdownFilter}
            value={modelName}
            label={i18n.t("Group by metadata type")}
        />,
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
    ];

    const apiQuery = {
        fields: groupType ? groupType.fields : fields,
        filter: {
            lastUpdated: lastUpdatedFilter
                ? { ge: moment(lastUpdatedFilter).format("YYYY-MM-DD") }
                : undefined,
            // TODO: d2-api ignores empty array for "in" filter
            id: onlySelectedFilter ? { in: [...syncRule.metadataIds, ""] } : undefined,
        },
    };

    const goBack = () => history.goBack();

    const handleTableChange = (tableState: TableState<DataPageType>) => {
        const { selection } = tableState;
        updateSyncRule(syncRule.updateMetadataIds(selection));
    };

    const onChange = async (syncRule: SyncRule) => {
        const enableDialogSync: boolean = await syncRule.isValid();
        updateSyncRule(syncRule);
        setState(state => ({ ...state, enableDialogSync }));
    };

    const closeSummary = () => {
        setState(state => ({ ...state, syncSummaryOpen: false }));
    };

    const startSynchronization = () => {
        if (syncRule.metadataIds.length > 0) {
            setState(state => ({ ...state, syncDialogOpen: true }));
        } else {
            snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    const finishSynchronization = (importResponse?: any) => {
        if (importResponse) {
            setState(state => ({
                ...state,
                syncDialogOpen: false,
                syncSummaryOpen: true,
                importResponse,
            }));
        } else {
            setState(state => ({ ...state, syncDialogOpen: false }));
        }
    };

    const handleSynchronization = async (syncRule: SyncRule) => {
        console.log(`syncronization for ${syncRule.name}: not implemented`);
    };

    return (
        <React.Fragment>
            <PageHeader onBackClick={goBack} title={title} />

            <D2ObjectsTable<DataPageType>
                apiMethod={apiMethod}
                apiQuery={apiQuery}
                columns={columns}
                filterComponents={filterComponents}
                forceSelectionColumn={true}
                details={details}
                actions={actions}
                selection={syncRule.metadataIds}
                onChange={handleTableChange}
                initialState={initialState}
                onActionButtonClick={appConfigurator ? startSynchronization : undefined}
                actionButtonLabel={<SyncIcon />}
                childrenTags={["dataElements", "dataElementGroups"]}
            />

            <SyncWizardDialog
                title={title}
                d2={d2 as D2}
                stepsBaseInfo={stepsBaseInfo}
                syncRule={syncRule}
                isOpen={state.syncDialogOpen}
                onChange={onChange}
                handleClose={finishSynchronization}
                task={handleSynchronization}
                enableSync={state.enableDialogSync}
            />

            <SyncSummary
                d2={d2}
                response={state.importResponse}
                isOpen={state.syncSummaryOpen}
                handleClose={closeSummary}
            />
        </React.Fragment>
    );
};

export default DataPage;
