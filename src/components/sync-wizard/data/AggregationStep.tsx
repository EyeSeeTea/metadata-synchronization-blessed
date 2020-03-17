import i18n from "@dhis2/d2-i18n";
import { makeStyles } from "@material-ui/core";
import _ from "lodash";
import React from "react";
import Dropdown from "../../dropdown/Dropdown";
import { Toggle } from "../../toggle/Toggle";
import { SyncWizardStepProps } from "../Steps";

const useStyles = makeStyles({
    dropdown: {
        marginTop: 20,
        marginLeft: -10,
    },
    fixedPeriod: {
        marginTop: 5,
        marginBottom: -20,
    },
    datePicker: {
        marginTop: -10,
    },
});

const aggregationItems = [
    { id: "DAILY", name: i18n.t("Daily"), format: "YYYYMMDD" },
    { id: "WEEKLY", name: i18n.t("Weekly"), format: "YYYY[W]W" },
    { id: "MONTHLY", name: i18n.t("Monthly"), format: "YYYYMM" },
    { id: "QUARTERLY", name: i18n.t("Quarterly"), format: "YYYY[Q]Q" },
    { id: "YEARLY", name: i18n.t("Yearly"), format: "YYYY" },
];

const AggregationStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const classes = useStyles();

    console.log("TODO", onChange);

    return (
        <React.Fragment>
            <Toggle
                label={i18n.t("Sync all events")}
                value={syncRule.dataSyncAllEvents}
                onValueChange={_.noop}
            />

            <div className={classes.dropdown}>
                <Dropdown
                    label={i18n.t("Aggregation measure")}
                    items={aggregationItems}
                    value={""}
                    onValueChange={_.noop}
                    hideEmpty={true}
                />
            </div>
        </React.Fragment>
    );
};

export default AggregationStep;
