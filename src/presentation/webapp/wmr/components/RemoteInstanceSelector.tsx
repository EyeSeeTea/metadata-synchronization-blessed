import { Box, Button } from "@material-ui/core";
import React from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../utils/i18n";
import { InstanceSelectionDropdown } from "../../../react/core/components/instance-selection-dropdown/InstanceSelectionDropdown";
import GeneralInfoForm from "../../core/pages/instance-creation/GeneralInfoForm";

export type RemoteInstanceSelectorProps = {
    value: Instance | null;
    onChange: (instance: Instance | null) => void;
};

export function RemoteInstanceSelector(props: RemoteInstanceSelectorProps) {
    const { value, onChange } = props;
    const [editingInstance, setEditingInstance] = React.useState<Instance | null>(null);
    const onClickAddNewInstance = () => {
        const newInstance = Instance.build({ name: "", description: "", url: "" });
        setEditingInstance(newInstance);
    };
    const onCancelAddNewInstance = () => {
        setEditingInstance(null);
    };
    const onChangeNewInstance = (instance: Instance) => {
        setEditingInstance(instance);
    };
    const onNewInstanceSaved = (instance: Instance) => {
        setEditingInstance(null);
        onChange(instance);
    };
    return (
        <Box p={2}>
            <InstanceSelectionDropdown
                showInstances={{ remote: true }}
                onChangeSelected={(instanceType, instance) => {
                    if (instanceType === "remote" && instance instanceof Instance) {
                        onChange(instance);
                        setEditingInstance(null);
                    }
                }}
                selectedInstance={value?.id}
            />
            {value?.url && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setEditingInstance(value)}
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                >
                    {i18n.t("Edit")}
                </Button>
            )}

            <Button
                variant="outlined"
                color="primary"
                onClick={onClickAddNewInstance}
                style={{ marginTop: "10px", marginLeft: "10px" }}
            >
                {i18n.t("Create New Target Instance")}
            </Button>

            {editingInstance && (
                <GeneralInfoForm
                    instance={editingInstance}
                    onChange={onChangeNewInstance}
                    cancelAction={onCancelAddNewInstance}
                    onSaved={onNewInstanceSaved}
                    testConnectionVisible={false}
                />
            )}
        </Box>
    );
}
