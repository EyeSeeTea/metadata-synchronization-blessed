import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { D2ModelSchemas } from "d2-api";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { D2Model, DataElementGroupModel } from "../../models/d2Model";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { getValidIds } from "../mapping-table/utils";
import MetadataTable from "../metadata-table/MetadataTable";

interface MappingDialogProps {
    rows: MetadataType[];
    elements: string[];
    model: typeof D2Model;
    instance: Instance;
    onClose: () => void;
    mapping: MetadataMappingDictionary;
    onUpdateMapping: (id?: string) => void;
    mappingPath?: string[];
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
    mappingPath,
}) => {
    const classes = useStyles();
    const [connectionSuccess, setConnectionSuccess] = useState(true);
    const api = instance.getApi();

    const element = elements.length === 1 ? _.find(rows, ["id", elements[0]]) : undefined;
    const mappedId = _.get(mapping, [model.getCollectionName(), element?.id ?? "", "mappedId"]);
    const defaultSelection = mappedId !== "DISABLED" ? mappedId : undefined;
    const [selected, updateSelected] = useState<string | undefined>(defaultSelection);
    const [filterRows, setFilterRows] = useState<string[]>([]);

    useEffect(() => {
        let mounted = true;

        instance.check().then(({ status }) => {
            if (mounted) setConnectionSuccess(status);
        });

        return () => {
            mounted = false;
        };
    }, [instance]);

    useEffect(() => {
        if (!mappingPath) return;

        const parentModel = d2ModelFactory(api, mappingPath[0] as keyof D2ModelSchemas);
        const parentMappedId = mappingPath[2];
        getValidIds(api, parentModel, parentMappedId).then(setFilterRows);
    }, [api, mappingPath]);

    const onUpdateSelection = (selectedIds: string[]) => {
        const newSelection = _.last(selectedIds);
        onUpdateMapping(newSelection);
        updateSelected(newSelection);
    };

    const OrgUnitMapper = (
        <div className={classes.orgUnitSelect}>
            <OrgUnitsSelector
                api={api}
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
            api={api}
            notifyNewSelection={onUpdateSelection}
            selectedIds={selected ? [selected] : undefined}
            hideSelectAll={true}
            initialShowOnlySelected={!!selected}
            filterRows={filterRows}
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
                {connectionSuccess ? (
                    MapperComponent
                ) : (
                    <Typography>{i18n.t("Could not connect with remote instance")}</Typography>
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingDialog;
