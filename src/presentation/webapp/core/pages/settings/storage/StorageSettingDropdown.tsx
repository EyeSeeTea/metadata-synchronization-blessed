import { Icon, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { useLoading } from "d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import i18n from "../../../../../../locales";
import Dropdown from "../../../../../react/core/components/dropdown/Dropdown";
import { useAppContext } from "../../../../../react/core/contexts/AppContext";

export const StorageSettingDropdown: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const loading = useLoading();

    const [selectedOption, setSelectedOption] = useState("dataStore");

    const options = useMemo(
        () => [
            { id: "dataStore" as const, name: i18n.t("Data Store") },
            { id: "constant" as const, name: i18n.t("Metadata constant") },
        ],
        []
    );

    const changeStorage = useCallback(
        async (storage: "constant" | "dataStore") => {
            loading.show(true, i18n.t("Updating storage location, please wait..."));
            await compositionRoot.config.setStorage(storage);

            const newStorage = await compositionRoot.config.getStorage();
            setSelectedOption(newStorage);
            loading.reset();
        },
        [compositionRoot, loading]
    );

    useEffect(() => {
        compositionRoot.config.getStorage().then(storage => setSelectedOption(storage));
    }, [compositionRoot]);

    return (
        <React.Fragment>
            <ListItem button>
                <ListItemIcon>
                    <Icon>storage</Icon>
                </ListItemIcon>
                <ListItemText
                    primary={i18n.t("Application storage")}
                    secondary={
                        <Dropdown<"constant" | "dataStore">
                            items={options}
                            value={selectedOption}
                            onValueChange={changeStorage}
                            hideEmpty={true}
                            view={"full-width"}
                        />
                    }
                />
            </ListItem>
        </React.Fragment>
    );
};
