import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../locales";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";
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
    view?: "dropdown" | "inline" | "full-width";
    title?: string;
}

export const InstanceSelectionDropdown: React.FC<InstanceSelectionDropdownProps> = React.memo(
    ({
        showInstances,
        selectedInstance,
        onChangeSelected,
        view = "dropdown",
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

        const updateSelectedInstanceEvent = useCallback(
            (event: React.ChangeEvent<{ value: unknown }>) => {
                updateSelectedInstance(event.target.value as string);
            },
            [updateSelectedInstance]
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

        switch (view) {
            case "dropdown":
                return (
                    <Dropdown
                        items={instanceItems}
                        value={selectedInstance}
                        onValueChange={updateSelectedInstance}
                        label={i18n.t("Instance")}
                        hideEmpty={true}
                    />
                );
            case "inline":
                return (
                    <Select
                        value={selectedInstance}
                        onChange={updateSelectedInstanceEvent}
                        disableUnderline={true}
                        style={{ minWidth: 120, paddingLeft: 25, paddingRight: 25 }}
                    >
                        {instanceItems.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                );
            case "full-width":
                return (
                    <FormControl fullWidth={true}>
                        <InputLabel>{title}</InputLabel>
                        <Select value={selectedInstance} onChange={updateSelectedInstanceEvent}>
                            {instanceItems.map(({ id, name }) => (
                                <MenuItem key={id} value={id}>
                                    {name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                );
            default:
                return null;
        }
    }
);
