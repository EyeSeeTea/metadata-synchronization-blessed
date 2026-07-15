import { useCallback, useEffect, useState } from "react";
import { ValidationError } from "../../../../../domain/common/entities/Validations";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { SynchronizationRule } from "../../../../../domain/rules/entities/SynchronizationRule";
import {
    RuleAggregatedDataExchange,
    RuleAggregatedDataExchangeProps,
} from "../../../../../domain/rules/value-object/RuleAggregatedDataExchange";
import { useAppContext } from "../../contexts/AppContext";

export function useAdexInstanceCredentials(
    syncRule: SynchronizationRule,
    onChange: (syncRule: SynchronizationRule) => void,
    onDismiss?: () => void
) {
    const [instances, setInstances] = useState<Instance[]>([]);
    const [adexInstanceCandidates, setAdexInstanceCandidates] = useState<RuleAggregatedDataExchangeProps[]>([]);
    const { compositionRoot } = useAppContext();
    const [errors, setErrors] = useState<{ [key: string]: ValidationError[] }>({});

    useEffect(() => {
        compositionRoot.instances.list({ ids: syncRule.targetInstances }).then(fetchedInstances => {
            setInstances(fetchedInstances);

            const adexs: RuleAggregatedDataExchangeProps[] = syncRule.targetInstances.map(instanceId => {
                const existingAdex = syncRule.aggregatedDataExchanges?.find(
                    adex => adex.target.instanceId === instanceId
                );
                if (existingAdex) {
                    return existingAdex.toProps();
                } else {
                    const instance = fetchedInstances.find(instance => instance.id === instanceId);
                    const type = instance?.isInternalDataExchange ? "internal" : "external";
                    return {
                        id: "",
                        target: { instanceId, type, authType: "http-basic", username: "", password: "" },
                    };
                }
            });

            setAdexInstanceCandidates(adexs);
        });
    }, [compositionRoot.instances, syncRule.aggregatedDataExchanges, syncRule.targetInstances]);

    const onChangeField = (instanceId: string, field: string, value: any) => {
        const adexInstanceCandidate = adexInstanceCandidates.find(adex => adex.target.instanceId === instanceId);

        if (adexInstanceCandidate) {
            const updatedAdexInstanceCandidate = {
                ...adexInstanceCandidate,
                target: {
                    ...adexInstanceCandidate.target,
                    [field]: value,
                },
            };

            const updatedAdexInstanceCandidates = adexInstanceCandidates.map(adex =>
                adex.target.instanceId === instanceId ? updatedAdexInstanceCandidate : adex
            );
            setAdexInstanceCandidates(updatedAdexInstanceCandidates);
        }
    };

    const onSave = useCallback(() => {
        const adexResult = adexInstanceCandidates.map(adex => RuleAggregatedDataExchange.create(adex));

        if (adexResult.filter(result => result.isError()).length === 0) {
            onChange(syncRule.updateAggregatedDataExchanges(adexResult.map(result => result.getOrThrow())));
            if (onDismiss) {
                onDismiss();
            }
        } else {
            const errors = adexResult.reduce((acc, result, index) => {
                if (result.isError()) {
                    const candidate = adexInstanceCandidates[index];
                    acc[candidate.target.instanceId] = result.value.error || [];
                }

                return acc;
            }, {} as { [key: string]: ValidationError[] });

            setErrors(errors);
        }
    }, [adexInstanceCandidates, onChange, syncRule, onDismiss]);

    return { instances, adexInstanceCandidates, onChangeField, onSave, errors };
}
