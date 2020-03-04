import { makeStyles, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useD2, useD2Api } from "d2-api";
import { OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import i18n from "../../../locales";
import { D2 } from "../../../types/d2";
import { getCurrentUserOrganisationUnits } from "../../../utils/d2";
import { SyncWizardStepProps } from "../Steps";

const useStyles = makeStyles({
    loading: {
        display: "flex",
        justifyContent: "center",
    },
});

const OrganisationUnitsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const api = useD2Api();
    const classes = useStyles();
    const [orgUnitRootIds, setOrgUnitRootIds] = useState<string[] | undefined>();

    useEffect(() => {
        getCurrentUserOrganisationUnits(d2 as D2).then(setOrgUnitRootIds);
    }, [d2]);

    const changeSelection = (orgUnitsPaths: string[]) => {
        onChange(syncRule.updateDataSyncOrgUnitPaths(orgUnitsPaths).updateDataSyncEvents([]));
    };

    if (!orgUnitRootIds) {
        return (
            <div className={classes.loading}>
                <CircularProgress />
            </div>
        );
    } else if (_.isEmpty(orgUnitRootIds)) {
        return <Typography>{i18n.t("You do not have assigned any organisation unit")}</Typography>;
    } else {
        return (
            <OrgUnitsSelector
                api={api}
                onChange={changeSelection}
                selected={syncRule.dataSyncOrgUnitPaths}
                rootIds={orgUnitRootIds}
                withElevation={false}
                initiallyExpanded={syncRule.dataSyncOrgUnitPaths}
            />
        );
    }
};

export default OrganisationUnitsSelectionStep;
