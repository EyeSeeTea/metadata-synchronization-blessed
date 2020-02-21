import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import MetadataTable from "../metadata-table/MetadataTable";

interface MappingDialogProps {
    rows: MetadataType[];
    elements: string[];
    model?: typeof D2Model;
    instance?: Instance;
    onClose: () => void;
    mapping?: MetadataMappingDictionary;
    onUpdateMapping: (id?: string) => void;
}

const useStyles = makeStyles({
    orgUnitSelect: {
        margin: "0 auto",
    },
});

const MappingDialog: React.FC<MappingDialogProps> = ({
    model = DataElementGroupModel,
    rows,
    elements,
    instance,
    onClose,
    mapping,
    onUpdateMapping,
}) => {
    const classes = useStyles();
    const [connectionSuccess, setConnectionSuccess] = useState(true);

    const element = elements.length === 1 ? _.find(rows, ["id", elements[0]]) : undefined;
    const mappedId = _.get(mapping, [model.getCollectionName(), element?.id ?? "", "mappedId"]);
    const defaultSelection = mappedId !== "DISABLED" ? mappedId : undefined;
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
        onUpdateMapping(newSelection);
        updateSelected(newSelection);
    };

    const OrgUnitMapper = (
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
            selectedIds={selected ? [selected] : undefined}
            hideSelectAll={true}
            initialShowOnlySelected={!!selected}
        />
    );

    const MapperComponent =
        model.getCollectionName() === "organisationUnits" ? OrgUnitMapper : MetadataMapper;

    const title =
        elements.length === 1
            ? i18n.t("Edit mapping for {{displayName}} ({{id}})", element)
            : i18n.t("Edit mapping for {{total}} elements", { total: elements.length });

    return (
        <ConfirmationDialog
            isOpen={elements.length > 0}
            title={title}
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
