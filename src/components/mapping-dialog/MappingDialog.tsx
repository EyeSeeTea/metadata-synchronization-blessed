import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { useD2 } from "d2-api";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import Instance from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import MetadataTable from "../metadata-table/MetadataTable";

interface MappingDialogProps {
    model?: typeof D2Model;
    element: MetadataType;
    instance: string;
    initialSelection?: string;
    onClose: () => void;
    onUpdateMapping: (id: string) => void;
}

const useStyles = makeStyles({
    orgUnitSelect: {
        margin: "0 auto",
        width: "fit-content",
    },
});

const MappingDialog: React.FC<MappingDialogProps> = ({
    model = DataElementGroupModel,
    element,
    instance: instanceId,
    initialSelection,
    onClose,
    onUpdateMapping,
}) => {
    const d2 = useD2();
    const classes = useStyles();

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
        const newSelection = _.last(selectedIds);
        if (newSelection) {
            onUpdateMapping(newSelection);
            updateSelected(newSelection);
        }
    };

    const OrgUnitMapper = instance?.getApi() && (
        <div className={classes.orgUnitSelect}>
            <OrgUnitsSelector
                api={instance?.getApi()}
                onChange={onUpdateSelection}
                selected={selected ? [selected] : []}
                withElevation={false}
                hideMemberCount={true}
                controls={{}}
                fullWidth={true}
            />
        </div>
    );

    const MetadataMapper = (
        <MetadataTable
            models={[model]}
            api={instance?.getApi()}
            notifyNewSelection={onUpdateSelection}
            selection={selected ? [{ id: selected }] : []}
            hideSelectAll={true}
        />
    );

    const MapperComponent =
        model.getCollectionName() === "organisationUnits" ? OrgUnitMapper : MetadataMapper;

    return (
        <ConfirmationDialog
            isOpen={!!element}
            title={i18n.t("Edit mapping for {{displayName}} ({{id}})", element)}
            onCancel={onClose}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                {!!instance?.getApi() && connectionSuccess && MapperComponent}

                {!connectionSuccess && (
                    <Typography>{i18n.t("Could not connect with remote instance")}</Typography>
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingDialog;
