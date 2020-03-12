import i18n from "@dhis2/d2-i18n";
import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { useD2 } from "d2-api";
import { ConfirmationDialog, OrgUnitsSelector } from "d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { d2ModelFactory } from "../../models/d2ModelFactory";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { D2 } from "../../types/d2";
import { MetadataType } from "../../utils/d2";
import { buildDataElementFilterForProgram, getValidIds } from "../mapping-table/utils";
import MetadataTable from "../metadata-table/MetadataTable";

export interface MappingDialogConfig {
    elements: string[];
    type: string;
    mappingPath: string[] | undefined;
    firstElement?: MetadataType;
}

export interface MappingDialogProps {
    config: MappingDialogConfig;
    instance: Instance;
    mapping: MetadataMappingDictionary;
    onUpdateMapping: (items: string[], id?: string) => void;
    onClose: () => void;
}

const useStyles = makeStyles({
    orgUnitSelect: {
        margin: "0 auto",
    },
});

const MappingDialog: React.FC<MappingDialogProps> = ({
    config,
    instance,
    mapping,
    onUpdateMapping,
    onClose,
}) => {
    const d2 = useD2() as D2;
    const classes = useStyles();
    const [connectionSuccess, setConnectionSuccess] = useState(true);
    const [filterRows, setFilterRows] = useState<string[] | undefined>();
    const { elements, type, mappingPath, firstElement } = config;

    const mappedId =
        elements.length === 1
            ? _.last(
                  _(mapping)
                      .get([type, elements[0] ?? "", "mappedId"])
                      ?.split("-")
              )
            : undefined;
    const defaultSelection = mappedId !== "DISABLED" ? mappedId : undefined;
    const [selected, updateSelected] = useState<string | undefined>(defaultSelection);

    const api = instance.getApi();
    const model = d2ModelFactory(api, type);
    const displayName = d2.models[model.getCollectionName()].displayName;

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
        if (mappingPath) {
            const parentModel = d2ModelFactory(api, mappingPath[0]);
            const parentMappedId = mappingPath[2];
            getValidIds(api, parentModel, parentMappedId).then(setFilterRows);
        } else if (type === "programDataElements" && elements.length === 1) {
            buildDataElementFilterForProgram(api, elements[0], mapping).then(setFilterRows);
        }
    }, [api, mappingPath, elements, mapping, type]);

    const onUpdateSelection = (selectedIds: string[]) => {
        const newSelection = _.last(selectedIds);
        onUpdateMapping(elements, newSelection);
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
                initiallyExpanded={selected ? [selected] : undefined}
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
            filterRows={filterRows}
            initialShowOnlySelected={!!selected}
        />
    );

    const MapperComponent =
        model.getCollectionName() === "organisationUnits" ? OrgUnitMapper : MetadataMapper;
    const title =
        elements.length > 1
            ? i18n.t(`Edit mapping for {{total}} elements - ${displayName}`, {
                  total: elements.length,
              })
            : i18n.t(`Edit mapping for {{name}} ({{id}}) - ${displayName}`, firstElement);

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
