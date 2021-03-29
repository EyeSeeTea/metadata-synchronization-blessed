import { makeStyles, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { OrgUnitsSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import i18n from "../../../../../../locales";
import { D2Api } from "../../../../../../types/d2-api";
import { useAppContext } from "../../../contexts/AppContext";
import { SyncWizardStepProps } from "../Steps";

const useStyles = makeStyles({
    loading: {
        display: "flex",
        justifyContent: "center",
    },
});

const OrganisationUnitsSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [orgUnitRootIds, setOrgUnitRootIds] = useState<string[] | undefined>();
    const [api, setApi] = useState<D2Api>();

    useEffect(() => {
        compositionRoot.instances.getById(syncRule.originInstance).then(result => {
            result.match({
                error: () => snackbar.error(i18n.t("Invalid origin instance")),
                success: instance => {
                    setApi(compositionRoot.instances.getApi(instance));

                    compositionRoot.instances
                        .getOrgUnitRoots(instance)
                        .then(roots => setOrgUnitRootIds(roots.map(({ id }) => id)));
                },
            });
        });
    }, [compositionRoot, syncRule.originInstance, snackbar]);

    const changeSelection = (orgUnitsPaths: string[]) => {
        onChange(syncRule.updateDataSyncOrgUnitPaths(orgUnitsPaths).updateDataSyncEvents([]));
    };

    if (!orgUnitRootIds || !api) {
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
                controls={{
                    filterByLevel: true,
                    filterByGroup: true,
                    filterByProgram: true,
                    selectAll: true,
                }}
            />
        );
    }
};

export default OrganisationUnitsSelectionStep;
