import React from "react";
import { withSnackbar, OrgUnitsSelector } from "d2-ui-components";
import SyncRule from "../../../../models/syncRule";
import { D2 } from "../../../../types/d2";
import { getCurrentUserOrganisationUnits } from "../../../../utils/d2";
import _ from "lodash";
import CircularProgress from "@material-ui/core/CircularProgress";

interface OrganisationUnitsStepProps {
    d2: D2;
    syncRule: SyncRule;
    onChange: (syncRule: SyncRule) => void;
}

const OrganisationUnitsSelectionStep: React.FC<OrganisationUnitsStepProps> = ({
    d2,
    syncRule,
    onChange,
}) => {
    const [organisationUnitsRootIds, setOrganisationUnitsRootIds] = React.useState<string[]>([]);
    const [selectedOrganisationUnits, setSelectedOrganisationUnits] = React.useState<string[]>(
        syncRule.organisationUnits
    );

    React.useEffect(() => {
        const retrieveOrganisationUnitsRootIds = async () => {
            const organisationUnitsRootIds = await getCurrentUserOrganisationUnits(d2);
            setOrganisationUnitsRootIds(organisationUnitsRootIds);
        };

        retrieveOrganisationUnitsRootIds();
    }, [d2]);

    const changeSelection = (orgUnitsPaths: string[]) => {
        setSelectedOrganisationUnits(orgUnitsPaths);
        onChange(syncRule.updateOrganisationUnits(orgUnitsPaths));
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
            />
        );
    }
};

export default withSnackbar(OrganisationUnitsSelectionStep);
