import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import { useD2 } from "d2-api";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import MetadataTable from "../metadata-table/MetadataTable";
import { Typography } from "@material-ui/core";

interface MappingDialogProps {
    model?: typeof D2Model;
    element: string;
    instance: string;
    onClose: () => void;
    onUpdateMapping: (id: string) => void;
}

const MappingDialog: React.FC<MappingDialogProps> = ({
    model = DataElementGroupModel,
    element,
    instance: instanceId,
    onClose,
    onUpdateMapping,
}) => {
    const d2 = useD2();
    const [instance, setInstance] = useState<Instance>();
    const [valid, setValid] = useState(true);
    const [orgUnits, updateOrgUnits] = useState<string[]>([]);

    useEffect(() => {
        Instance.get(d2 as D2, instanceId).then(setInstance);
    }, [d2, instanceId]);

    useEffect(() => {
        instance?.check().then(({ status }) => setValid(status));
    }, [d2, instance]);

    const onUpdateSelection = (selectedIds: string[]) => {
        if (selectedIds[0]) {
            onUpdateMapping(selectedIds[0]);
            onClose();
        }
    };

    return (
        <ConfirmationDialog
            isOpen={!!element}
            title={i18n.t("Edit mapping")}
            onCancel={onClose}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                {false && (
                    <OrgUnitsSelector
                        d2={null}
                        onChange={updateOrgUnits}
                        selected={orgUnits}
                        withElevation={false}
                    />
                )}
                {valid ? (
                    <MetadataTable
                        models={[model]}
                        api={instance?.getApi()}
                        notifyNewSelection={onUpdateSelection}
                        hideSelectAll={true}
                    />
                ) : (
                    <Typography>{i18n.t("Could not connect with remote instance")}</Typography>
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingDialog;
