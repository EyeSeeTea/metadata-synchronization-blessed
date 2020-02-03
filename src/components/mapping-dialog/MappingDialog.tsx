import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import Instance from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import MetadataTable from "../metadata-table/MetadataTable";

interface MappingDialogProps {
    element: MetadataType;
    model?: typeof D2Model;
    instance?: Instance;
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
    instance,
    onClose,
    onUpdateMapping,
}) => {
    const classes = useStyles();
    const [connectionSuccess, setConnectionSuccess] = useState(true);

    const defaultSelection = _.get(instance?.metadataMapping, [
        model.getCollectionName(),
        element.id,
        "mappedId",
    ]);
    const [selected, updateSelected] = useState<string | undefined>(defaultSelection);

    useEffect(() => {
        let mounted = true;

        instance?.check().then(({ status }) => {
            if (mounted) setConnectionSuccess(status);
        });

        return () => {
            mounted = false;
        };
    }, [instance]);

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
            cancelText={i18n.t("Close")}
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
