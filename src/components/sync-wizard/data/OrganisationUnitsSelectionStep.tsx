import React, { useEffect, useState } from "react";
import { withSnackbar, OrgUnitsSelector } from "d2-ui-components";
import SyncRule from "../../../models/syncRule";
import { D2 } from "../../../types/d2";
import { getCurrentUserOrganisationUnits } from "../../../utils/d2";
import _ from "lodash";
import CircularProgress from "@material-ui/core/CircularProgress";
import { useD2 } from "d2-api";

interface OrganisationUnitsStepProps {
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

const OrganisationUnitsSelectionStep: React.FC<OrganisationUnitsStepProps> = ({
    syncRule,
    onChange,
}) => {
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
