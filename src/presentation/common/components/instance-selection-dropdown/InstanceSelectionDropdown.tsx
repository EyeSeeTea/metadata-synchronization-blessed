import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import Dropdown, { DropdownViewOption } from "../../../webapp/components/dropdown/Dropdown";
import { useAppContext } from "../../contexts/AppContext";

export interface InstanceSelectionConfig {
    local?: boolean;
    remote?: boolean;
    store?: boolean;
}

export interface InstanceSelectionDropdownProps {
    showInstances: InstanceSelectionConfig;
    selectedInstance: string;
    onChangeSelected: (instance?: Instance) => void;
    view?: DropdownViewOption;
    title?: string;
}

export const InstanceSelectionDropdown: React.FC<InstanceSelectionDropdownProps> = React.memo(
    ({
        showInstances,
        selectedInstance,
        onChangeSelected,
        view = "filter",
        title = i18n.t("Instances"),
    }) => {
        const { compositionRoot } = useAppContext();

        const [instances, setInstances] = useState<Instance[]>([]);

        const updateSelectedInstance = useCallback(
            (id: string) => {
                onChangeSelected(instances.find(instance => instance.id === id));
            },
            [instances, onChangeSelected]
        );

        const instanceItems = useMemo(
            () =>
                _.compact([
                    showInstances.local && { id: "LOCAL", name: i18n.t("This instance") },
                    showInstances.store && { id: "STORE", name: i18n.t("Store") },
                    ...(showInstances.remote ? instances : []),
                ]),
            [showInstances, instances]
        );

        useEffect(() => {
            compositionRoot.instances.list().then(setInstances);
        }, [compositionRoot]);

        return (
            <Dropdown
                items={instanceItems}
                value={selectedInstance}
                onValueChange={updateSelectedInstance}
                label={title}
                hideEmpty={true}
                view={view}
            />
        );
    }
);
