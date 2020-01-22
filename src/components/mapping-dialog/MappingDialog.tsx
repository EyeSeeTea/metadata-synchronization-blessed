import i18n from "@dhis2/d2-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import { useD2, useD2Api } from "d2-api";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import MetadataTable from "../metadata-table/MetadataTable";
import { Typography } from "@material-ui/core";
import _ from "lodash";

interface MappingDialogProps {
    model?: typeof D2Model;
    element: string;
    instance: string;
    initialSelection?: string;
    onClose: () => void;
    onUpdateMapping: (id: string) => void;
}

const MappingDialog: React.FC<MappingDialogProps> = ({
    model = DataElementGroupModel,
    element,
    instance: instanceId,
    initialSelection,
    onClose,
    onUpdateMapping,
}) => {
    const d2 = useD2();
    const api = useD2Api();
    const [instance, setInstance] = useState<Instance>();
    const [connectionSuccess, setConnectionSuccess] = useState(true);
    const [selected, updateSelected] = useState<string | undefined>(initialSelection);

    useEffect(() => {
        Instance.get(d2 as D2, instanceId).then(setInstance);
    }, [d2, instanceId]);

    useEffect(() => {
        instance?.check().then(({ status }) => setConnectionSuccess(status));
    }, [d2, instance]);

    const onUpdateSelection = (selectedIds: string[]) => {
        const element = _.last(selectedIds);
        if (element) {
            onUpdateMapping(element);
            updateSelected(element);
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
                {connectionSuccess ? (
                    model.getCollectionName() === "organisationUnits" ? (
                        <div style={{ margin: "0 auto", width: "fit-content" }}>
                            <OrgUnitsSelector
                                api={api}
                                onChange={onUpdateSelection}
                                selected={[selected]}
                                withElevation={false}
                                hideMemberCount={true}
                                controls={{}}
                                fullWidth={true}
                            />
                        </div>
                    ) : (
                        <MetadataTable
                            models={[model]}
                            api={instance?.getApi()}
                            notifyNewSelection={onUpdateSelection}
                            selection={selected ? [{ id: selected }] : []}
                            hideSelectAll={true}
                        />
                    )
                ) : (
                    <Typography>{i18n.t("Could not connect with remote instance")}</Typography>
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingDialog;
