import { MultiSelector, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, makeStyles, Typography } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../../../../domain/instance/entities/Instance";
import { RuleAggregatedDataExchange } from "../../../../../../domain/rules/value-object/RuleAggregatedDataExchange";
import { User } from "../../../../../../domain/user/entities/User";
import i18n from "../../../../../../utils/i18n";
import { useAppContext } from "../../../contexts/AppContext";
import { useLocalInstance } from "../../../hooks/useLocalInstance";
import AdexInstanceCredentialsDialog from "../../adex-instances-credentials-dialog/AdexInstanceCredentialsDialog";
import SyncParamsSelector from "../../sync-params-selector/SyncParamsSelector";
import { SyncWizardStepProps } from "../Steps";

export const buildInstanceOptions = (instances: Instance[], currentUser: User) => {
    return instances.map(instance => {
        const buildName = () => {
            if (instance.username) {
                return i18n.t("with user {{username}}", instance);
            } else if (instance.hasPermissions("read", currentUser)) {
                return i18n.t("with logged user");
            } else {
                return i18n.t("with stored user");
            }
        };

        return { value: instance.id, text: `${instance.name} (${instance.url}) ` + buildName() };
    });
};

export const buildAdexTargetInstances = (
    selectedInstanceIds: string[],
    existingAdexes: RuleAggregatedDataExchange[],
    availableInstances: Instance[]
): RuleAggregatedDataExchange[] => {
    return selectedInstanceIds.flatMap(instanceId => {
        const existingAdex = existingAdexes.find(adex => adex.target.instanceId === instanceId);
        if (existingAdex) return [existingAdex];

        const instance = availableInstances.find(target => target.id === instanceId);
        if (instance?.isInternalDataExchange) {
            return [
                RuleAggregatedDataExchange.create({
                    id: "",
                    target: { instanceId, type: "internal", authType: "http-basic" },
                }).getOrThrow(),
            ];
        }

        return [];
    });
};

const InstanceSelectionStep: React.FC<SyncWizardStepProps> = ({ syncRule, onChange }) => {
    const { d2, compositionRoot } = useAppContext();
    const classes = useStyles();

    const [selectedOptions, setSelectedOptions] = useState<string[]>(syncRule.targetInstances);
    const [targetInstances, setTargetInstances] = useState<Instance[]>([]);
    const [instanceOptions, setInstanceOptions] = useState<{ value: string; text: string }[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const snackbar = useSnackbar();

    const { localInstance, error } = useLocalInstance();

    useEffect(() => {
        if (error) snackbar.error(i18n.t("Error fetching local instance"));
    }, [error, snackbar]);

    const includeCurrentUrlAndTypeIsEvents = (selectedinstanceIds: string[]) => {
        return (
            syncRule.type === "events" &&
            !syncRule.useAggregatedDataExchange &&
            selectedinstanceIds
                .map(id => targetInstances.find(instance => instance.id === id)?.url)
                .includes(localInstance?.url)
        );
    };

    const changeInstances = (instances: string[]) => {
        setSelectedOptions(instances);

        if (includeCurrentUrlAndTypeIsEvents(instances)) {
            onChange(
                syncRule.updateTargetInstances(instances).updateDataParams({
                    ...syncRule.dataParams,
                    generateNewUid: true,
                })
            );
        } else {
            onChange(syncRule.updateTargetInstances(instances));
        }
    };

    useEffect(() => {
        compositionRoot.instances
            .list({ types: syncRule.useAggregatedDataExchange ? ["aggregated-data-exchange"] : ["dhis", "local"] })
            .then(instances => {
                setTargetInstances(instances);
                compositionRoot.user.current().then(user => setInstanceOptions(buildInstanceOptions(instances, user)));
            });
    }, [compositionRoot, syncRule.useAggregatedDataExchange]);

    useEffect(() => {
        if (!syncRule.useAggregatedDataExchange || targetInstances.length === 0) return;

        const existingAdexes = syncRule.aggregatedDataExchanges ?? [];
        const reconciledAdexes = buildAdexTargetInstances(syncRule.targetInstances, existingAdexes, targetInstances);

        const existingIds = existingAdexes.map(adex => adex.target.instanceId).sort();
        const reconciledIds = reconciledAdexes.map(adex => adex.target.instanceId).sort();

        if (existingIds.join() !== reconciledIds.join()) {
            onChange(syncRule.updateAggregatedDataExchanges(reconciledAdexes));
        }
    }, [syncRule, targetInstances, onChange]);

    const onSetAdexCredentials = useCallback(() => {
        setShowDialog(true);
    }, []);

    const selectedTargetInstances = targetInstances.filter(instance => syncRule.targetInstances.includes(instance.id));
    const hasExternalTargetSelected = selectedTargetInstances.some(instance => !instance.isInternalDataExchange);

    return (
        <React.Fragment>
            {syncRule.originInstance === "LOCAL" ? (
                <MultiSelector
                    d2={d2}
                    height={300}
                    onChange={changeInstances}
                    options={instanceOptions}
                    selected={selectedOptions}
                />
            ) : (
                <Typography className={classes.advancedOptionsTitle} variant="subtitle1" gutterBottom>
                    {i18n.t("Destination")}: {i18n.t("This instance")}
                </Typography>
            )}

            {syncRule.useAggregatedDataExchange === false && (
                <SyncParamsSelector
                    syncRule={syncRule}
                    onChange={onChange}
                    generateNewUidDisabled={includeCurrentUrlAndTypeIsEvents(selectedOptions)}
                />
            )}
            {syncRule.useAggregatedDataExchange && syncRule.targetInstances.length > 0 && hasExternalTargetSelected && (
                <Button variant="contained" onClick={onSetAdexCredentials} style={{ marginTop: 16 }}>
                    {i18n.t("Set Credentials")}
                </Button>
            )}
            {showDialog && (
                <AdexInstanceCredentialsDialog
                    onDismiss={() => setShowDialog(false)}
                    syncRule={syncRule}
                    onChange={onChange}
                />
            )}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    advancedOptionsTitle: {
        fontWeight: 500,
    },
});

export default InstanceSelectionStep;
