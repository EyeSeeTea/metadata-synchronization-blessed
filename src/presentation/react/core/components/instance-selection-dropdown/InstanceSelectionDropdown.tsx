import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../locales";
import { Maybe } from "../../../../../types/utils";
import Dropdown, { DropdownViewOption } from "../dropdown/Dropdown";
import { useAppContext } from "../../contexts/AppContext";
import { Store } from "../../../../../domain/stores/entities/Store";
import { User } from "../../../../../domain/user/entities/User";

export type InstanceSelectionOption = "local" | "remote" | "store";

export type InstanceSelectionConfig = Partial<Record<InstanceSelectionOption, boolean>>;

export interface InstanceSelectionDropdownProps {
    showInstances: InstanceSelectionConfig;
    selectedInstance: Maybe<string>;
    onChangeSelected: <T extends InstanceSelectionOption>(
        type: T,
        instance?: T extends "remote" ? Instance : T extends "store" ? Store : never
    ) => void;
    view?: DropdownViewOption;
    title?: string;
    refreshKey?: number;
}

export const InstanceSelectionDropdown: React.FC<InstanceSelectionDropdownProps> = React.memo(
    ({
        showInstances,
        selectedInstance,
        onChangeSelected,
        view = "filter",
        title = i18n.t("Instances"),
        refreshKey,
    }) => {
        const { compositionRoot } = useAppContext();

        const [instances, setInstances] = useState<Instance[]>([]);
        const [stores, setStores] = useState<Store[]>([]);
        const [user, setUser] = useState<User>();

        const updateSelectedInstance = useCallback(
            (id: string) => {
                if (id === "LOCAL") {
                    onChangeSelected("local");
                } else {
                    const store = stores.find(store => store.id === id);
                    const instance = instances.find(instance => instance.id === id);

                    onChangeSelected(instance ? "remote" : "store", instance ?? store);
                }
            },
            [instances, stores, onChangeSelected]
        );

        const instanceItems = useMemo(() => {
            const localInstance = { id: "LOCAL", name: i18n.t("This instance") };
            const storeInstances = stores.map(store => ({
                id: store.id,
                name: `${store.account} - ${store.repository} (${i18n.t("Store")})`,
            }));

            return _.compact([
                showInstances.local && localInstance,
                ...(showInstances.store ? storeInstances : []),
                ...(showInstances.remote ? instances.filter(item => item.type === "dhis") : []),
            ]);
        }, [showInstances, instances, stores]);

        useEffect(() => {
            compositionRoot.user.current().then(setUser);
        }, [compositionRoot.user]);

        useEffect(() => {
            compositionRoot.instances.list().then(instances => {
                const instancesWithPermisions = user
                    ? instances.filter(instance => instance.hasPermissions("read", user))
                    : [];
                setInstances(instancesWithPermisions);
            });

            if (showInstances.store) {
                compositionRoot.store.list().then(setStores);
            }
        }, [compositionRoot, showInstances, refreshKey, user]);

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
                value={selectedInstance ?? instanceItems[0]?.id ?? ""}
                onValueChange={updateSelectedInstance}
                label={title}
                hideEmpty={true}
                view={view}
            />
        );
    }
);
