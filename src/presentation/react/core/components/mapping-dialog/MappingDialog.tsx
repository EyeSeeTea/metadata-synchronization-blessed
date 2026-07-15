import { Typography } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { makeStyles } from "@material-ui/styles";
import { ConfirmationDialog, OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { DataSource, isDhisInstance } from "../../../../../domain/instance/entities/DataSource";
import { MetadataMappingDictionary } from "../../../../../domain/mapping/entities/MetadataMapping";
import i18n from "../../../../../utils/i18n";
import { modelFactory } from "../../../../../models/dhis/factory";
import { MetadataType } from "../../../../../utils/d2";
import { useAppContext } from "../../contexts/AppContext";
import { EXCLUDED_KEY } from "../mapping-table/utils";
import MetadataTable from "../metadata-table/MetadataTable";
import { Id } from "../../../../../domain/common/entities/Schemas";

export interface MappingDialogConfig {
    elements: string[];
    mappingType?: string;
    mappingPath?: string[];
    firstElement?: MetadataType;
}

export interface MappingDialogProps {
    config: MappingDialogConfig;
    instance: DataSource;
    mapping: MetadataMappingDictionary;
    onUpdateMapping: (items: string[], id?: string) => void;
    onClose: () => void;
    filterIds?: Id[];
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
    filterIds,
}) => {
    const { api: defaultApi, compositionRoot } = useAppContext();
    const classes = useStyles();
    const [connectionSuccess, setConnectionSuccess] = useState(true);
    const [filterRows, setFilterRows] = useState<string[] | undefined>();
    const { elements, mappingType, mappingPath, firstElement } = config;
    if (!mappingType) {
        throw new Error("Attempting to open mapping dialog without a valid mapping type");
    }

    const mappedId = useMemo(() => {
        return elements.length === 1
            ? _.last(
                  _(mapping)
                      .get([mappingType, elements[0] ?? "", "mappedId"])
                      ?.split("-")
              )
            : undefined;
    }, [elements, mapping, mappingType]);

    const defaultSelection = useMemo(() => {
        return mappedId !== "DISABLED" ? mappedId : undefined;
    }, [mappedId]);

    const [selected, updateSelected] = useState<string | undefined>(defaultSelection);

    const model = useMemo(() => modelFactory(mappingType), [mappingType]);
    const modelName = useMemo(() => model.getModelName(), [model]);
    const api = useMemo(() => {
        return isDhisInstance(instance) ? compositionRoot.instances.getApi(instance) : defaultApi;
    }, [instance, compositionRoot, defaultApi]);

    useEffect(() => {
        let mounted = true;

        if (isDhisInstance(instance)) {
            compositionRoot.instances.validate(instance).then(result => {
                if (result.isError()) console.error(result.value.error);
                if (mounted) setConnectionSuccess(result.isSuccess());
            });
        }

        return () => {
            mounted = false;
        };
    }, [instance, compositionRoot]);

    useEffect(() => {
        if (mappingPath) {
            const parentMappedId = mappingPath[2];
            compositionRoot.mapping.getValidIds(instance, parentMappedId).then(setFilterRows);
        } else if (mappingType === "programDataElements" && elements.length === 1) {
            const elementParts = elements[0].split("-");

            const programId = _.first(elementParts) ?? elements[0];
            const programStage = elementParts.length === 3 ? elementParts[1] : undefined;

            const mappedProgramByEventProgram = mapping["eventPrograms"]
                ? mapping["eventPrograms"][programId]
                : undefined;
            const mappedProgramByTrackerProgram = mapping["trackerPrograms"]
                ? mapping["trackerPrograms"][programId]
                : undefined;
            const mappedByTrackerProgramStage = mapping["trackerProgramStages"]
                ? mapping["trackerProgramStages"][`${programId}-${programStage}`]
                : undefined;

            const parentMappedId =
                mappedByTrackerProgramStage?.mappedId ||
                mappedProgramByTrackerProgram?.mappedId ||
                mappedProgramByEventProgram?.mappedId;

            if (!parentMappedId) return;

            compositionRoot.mapping.getValidIds(instance, parentMappedId).then(validIds => {
                setFilterRows(buildFilterForProgram(validIds, parentMappedId));
            });
        } else if (mappingType === "trackerProgramStages" && elements.length === 1) {
            const programId = _.first(elements[0].split("-")) ?? elements[0];

            const mappedProgramId = mapping["trackerPrograms"]
                ? mapping["trackerPrograms"][programId]?.mappedId
                : undefined;

            if (!mappedProgramId) return;

            compositionRoot.mapping.getValidIds(instance, mappedProgramId).then(validIds => {
                setFilterRows(buildFilterForProgram(validIds, mappedProgramId));
            });
        }
    }, [compositionRoot, instance, mappingPath, elements, mapping, mappingType]);

    const onUpdateSelection = useCallback(
        (selectedIds: string[]) => {
            const newSelection = _.last(selectedIds);
            onUpdateMapping(elements, newSelection);
            updateSelected(newSelection);
        },
        [elements, onUpdateMapping]
    );

    const OrgUnitMapper = useMemo(
        () => (
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
        ),
        [api, onUpdateSelection, selected, classes.orgUnitSelect]
    );

    const MetadataMapper = useMemo(() => {
        const metadataTableFilterRows = _(filterRows)
            .concat(filterIds || [])
            .compact()
            .value();
        return (
            <MetadataTable
                models={[model]}
                remoteInstance={instance}
                notifyNewSelection={onUpdateSelection}
                selectedIds={selected ? [selected] : undefined}
                hideSelectAll={true}
                filterRows={metadataTableFilterRows}
                initialShowOnlySelected={!!selected}
                viewFilters={_.compact([
                    "group",
                    "onlySelected",
                    metadataTableFilterRows ? "disableFilterRows" : undefined,
                ])}
            />
        );
    }, [model, instance, onUpdateSelection, selected, filterRows, filterIds]);

    const MapperComponent = useMemo(() => {
        return model.getCollectionName() === "organisationUnits" ? OrgUnitMapper : MetadataMapper;
    }, [model, OrgUnitMapper, MetadataMapper]);

    const title = useMemo(() => {
        return elements.length > 1 || !firstElement
            ? i18n.t("Select {{type}} from destination instance {{instance}} to map {{total}} elements", {
                  type: modelName,
                  instance: instance.name,
                  total: elements.length,
              })
            : i18n.t("Select {{type}} from destination instance {{instance}} to map {{name}} ({{id}})", {
                  type: modelName,
                  instance: instance.name,
                  name: firstElement.name,
                  id: firstElement.id,
              });
    }, [elements.length, firstElement, modelName, instance.name]);

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

const buildFilterForProgram = (validIds: string[], mappedId: string): string[] | undefined => {
    if (!mappedId || mappedId === EXCLUDED_KEY) return undefined;
    return [...validIds, mappedId];
};

export default MappingDialog;
