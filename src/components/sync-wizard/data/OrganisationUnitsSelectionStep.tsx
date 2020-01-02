import CircularProgress from "@material-ui/core/CircularProgress";
import { useD2 } from "d2-api";
import { OrgUnitsSelector, withSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { D2 } from "../../../types/d2";
import { getCurrentUserOrganisationUnits } from "../../../utils/d2";
import { SyncWizardStepProps } from "../Steps";

const OrganisationUnitsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const d2 = useD2();
    const [organisationUnitsRootIds, setOrganisationUnitsRootIds] = useState<string[]>([]);

    useEffect(() => {
        getCurrentUserOrganisationUnits(d2 as D2).then(setOrganisationUnitsRootIds);
    }, [d2]);

    const changeSelection = (orgUnitsPaths: string[]) => {
        onChange(syncRule.updateDataSyncOrgUnitPaths(orgUnitsPaths).updateDataSyncEvents([]));
    };

    if (_.isEmpty(organisationUnitsRootIds)) {
        return (
            <div style={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </div>
        );
    } else {
        return (
            <OrgUnitsSelector
                d2={d2}
                onChange={changeSelection}
                selected={syncRule.dataSyncOrgUnitPaths}
                rootIds={organisationUnitsRootIds}
                withElevation={false}
            />
        );
    }
};

export default withSnackbar(OrganisationUnitsSelectionStep);
