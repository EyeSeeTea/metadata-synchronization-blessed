import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import Dropdown, { DropdownViewOption } from "../../../webapp/components/dropdown/Dropdown";
import { useAppContext } from "../../contexts/AppContext";
import { Maybe } from "../../../../types/utils";

export type InstanceSelectionOption = "local" | "remote" | "store";

export type InstanceSelectionConfig = Partial<Record<InstanceSelectionOption, boolean>>;

export interface InstanceSelectionDropdownProps {
    showInstances: InstanceSelectionConfig;
    selectedInstance: Maybe<string>;
    onChangeSelected: <T extends InstanceSelectionOption>(
        type: T,
        instance?: T extends "remote" ? Instance : never
    ) => void;
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
                if (id === "STORE") {
                    onChangeSelected("store");
                } else if (id === "LOCAL") {
                    onChangeSelected("local");
                } else {
                    onChangeSelected(
                        "remote",
                        instances.find(instance => instance.id === id)
                    );
                }
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

        useEffect(() => {
            // Auto-select first instance
            const firstInstanceItem = instanceItems[0];
            if (_.isNil(selectedInstance) && firstInstanceItem) {
                updateSelectedInstance(firstInstanceItem.id);
            }
        }, [instanceItems, selectedInstance, updateSelectedInstance]);

        return (
            <Dropdown
                items={instanceItems}
                value={selectedInstance || instanceItems[0]?.id || ""}
                onValueChange={updateSelectedInstance}
                label={title}
                hideEmpty={true}
                view={view}
            />
        );
    }
);
