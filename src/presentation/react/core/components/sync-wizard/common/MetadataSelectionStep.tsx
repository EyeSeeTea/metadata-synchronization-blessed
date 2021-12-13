import { Icon } from "@material-ui/core";
import { RowConfig, TableAction, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Instance } from "../../../../../../domain/instance/entities/Instance";
import i18n from "../../../../../../locales";
import { D2Model } from "../../../../../../models/dhis/default";
import { metadataModels } from "../../../../../../models/dhis/factory";
import {
    AggregatedDataElementModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    EventProgramWithProgramStagesModel,
    ProgramIndicatorMappedModel,
} from "../../../../../../models/dhis/mapping";
import {
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    IndicatorModel,
} from "../../../../../../models/dhis/metadata";
import { MetadataType } from "../../../../../../utils/d2";
import { getMetadata } from "../../../../../../utils/synchronization";
import { useAppContext } from "../../../contexts/AppContext";
import { getChildrenRows } from "../../mapping-table/utils";
import MetadataTable from "../../metadata-table/MetadataTable";
import { SyncWizardStepProps } from "../Steps";

const config = {
    metadata: {
        models: metadataModels,
        childrenKeys: undefined,
    },
    aggregated: {
        models: [
            DataSetModel,
            AggregatedDataElementModel,
            DataElementGroupModel,
            DataElementGroupSetModel,
            IndicatorModel,
        ],
        childrenKeys: ["dataElements", "dataElementGroups"],
    },
    events: {
        models: [
            EventProgramWithDataElementsModel,
            EventProgramWithProgramStagesModel,
            EventProgramWithIndicatorsModel,
            ProgramIndicatorMappedModel,
        ],
        childrenKeys: ["dataElements", "programIndicators", "stages"],
    },
    deleted: {
        models: [],
        childrenKeys: undefined,
    },
};

export default function MetadataSelectionStep({ syncRule, onChange }: SyncWizardStepProps) {
    const { api, compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);
    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const { models, childrenKeys } = config[syncRule.type];

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? {});
    const [rows, setRows] = useState<MetadataType[]>([]);

    const changeSelection = useCallback(
        (newMetadataIds: string[], newExclusionIds: string[]) => {
            const additions = _.difference(newMetadataIds, metadataIds);
            if (additions.length > 0) {
                snackbar.info(i18n.t("Selected {{difference}} elements", { difference: additions.length }), {
                    autoHideDuration: 1000,
                });
            }

            const removals = _.difference(metadataIds, newMetadataIds);
            if (removals.length > 0) {
                snackbar.info(
                    i18n.t("Removed {{difference}} elements", {
                        difference: Math.abs(removals.length),
                    }),
                    { autoHideDuration: 1000 }
                );
            }

            getMetadata(api, newMetadataIds, "id").then(metadata => {
                const types = _.keys(metadata);
                onChange(
                    syncRule
                        .updateMetadataIds(newMetadataIds)
                        .updateExcludedIds(newExclusionIds)
                        .updateMetadataTypes(types)
                        .updateDataSyncEnableAggregation(
                            types.includes("indicators") || types.includes("programIndicators")
                        )
                );
            });

            updateMetadataIds(newMetadataIds);
        },
        [api, metadataIds, onChange, snackbar, syncRule]
    );

    useEffect(() => {
        compositionRoot.instances.getById(syncRule.originInstance).then(result => {
            result.match({
                success: instance => {
                    setRemoteInstance(instance);
                    setLoading(false);
                },
                error: () => {
                    snackbar.error(i18n.t("Instance not found"));
                    setLoading(false);
                    setError(true);
                },
            });
        });
    }, [compositionRoot, snackbar, syncRule.originInstance]);

    const notifyNewModel = useCallback(model => {
        setModel(() => model);
    }, []);

    const updateRows = useCallback(
        (rows: MetadataType[]) => {
            setRows([...rows, ...getChildrenRows(rows, model)]);
        },
        [model]
    );

    const rowConfig = React.useCallback(
        (item: MetadataType): RowConfig => ({
            disabled: !item.model.getIsSelectable(),
            selectable: item.model.getIsSelectable(),
        }),
        []
    );

    const actions: TableAction<MetadataType>[] = useMemo(
        () =>
            syncRule.type === "events"
                ? [
                      {
                          name: "select-children-rows",
                          text: i18n.t("Select children"),
                          multiple: true,
                          onClick: (selection: string[]) => {
                              const selectedRows = _.compact(selection.map(id => _.find(rows, ["id", id])));
                              const children = getChildrenRows(selectedRows, model).map(({ id }) => id);

                              const newSelected = _.uniq([...syncRule.metadataIds, ...children]);
                              changeSelection(newSelected, []);
                          },
                          icon: <Icon>done_all</Icon>,
                          isActive: (selection: MetadataType[]) => {
                              const children = getChildrenRows(selection, model);
                              return children.length > 0;
                          },
                      },
                  ]
                : [],
        [model, rows, changeSelection, syncRule.type, syncRule.metadataIds]
    );

    if (loading || error) return null;

    return (
        <MetadataTable
            rowConfig={rowConfig}
            models={models}
            selectedIds={syncRule.metadataIds}
            excludedIds={syncRule.excludedIds}
            additionalActions={actions}
            notifyNewSelection={changeSelection}
            childrenKeys={childrenKeys}
            showIndeterminateSelection={true}
            remoteInstance={remoteInstance}
            notifyNewModel={notifyNewModel}
            notifyRowsChange={updateRows}
        />
    );
}
