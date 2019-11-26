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
    const [selectedOrganisationUnits, setSelectedOrganisationUnits] = useState<string[]>(
        syncRule.dataSyncOrganisationUnits
    );

    useEffect(() => {
        const retrieveOrganisationUnitsRootIds = async () => {
            const organisationUnitsRootIds = await getCurrentUserOrganisationUnits(d2 as D2);
            setOrganisationUnitsRootIds(organisationUnitsRootIds);
        };

        retrieveOrganisationUnitsRootIds();
    }, [d2]);

    const changeSelection = (orgUnitsPaths: string[]) => {
        setSelectedOrganisationUnits(orgUnitsPaths);
        onChange(syncRule.updateDataSyncOrganisationUnits(orgUnitsPaths));
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
                selected={selectedOrganisationUnits}
                rootIds={organisationUnitsRootIds}
                withElevation={false}
            />
        );
    }
};

export default withSnackbar(OrganisationUnitsSelectionStep);
