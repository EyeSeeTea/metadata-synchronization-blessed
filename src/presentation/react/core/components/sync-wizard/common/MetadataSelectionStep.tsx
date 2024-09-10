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
import { useAppContext } from "../../../contexts/AppContext";
import { getChildrenRows } from "../../mapping-table/utils";
import MetadataTable from "../../metadata-table/MetadataTable";
import { SyncWizardStepProps } from "../Steps";
import { DataStoreMetadata } from "../../../../../../domain/data-store/DataStoreMetadata";

const config = {
    metadata: {
        models: metadataModels,
        childrenKeys: ["keys"],
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
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();

    const [metadataIds, updateMetadataIds] = useState<string[]>([]);
    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const { models, childrenKeys } = config[syncRule.type];

    const [model, setModel] = useState<typeof D2Model>(() => models[0] ?? {});
    const [rows, setRows] = useState<MetadataType[]>([]);
    const [idsToIgnore, setIdsToIgnore] = useState<string[]>([]);
    const [metadataModelsSyncAll, setMetadataModelsSyncAll] = useState(syncRule.metadataModelsSyncAll);

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

            const onlyMetadataIds = newMetadataIds.filter(id => !id.includes(DataStoreMetadata.NS_SEPARATOR));

            compositionRoot.metadata.getByIds(onlyMetadataIds, remoteInstance, "id").then(metadata => {
                const types = _(metadata).keys().concat(metadataModelsSyncAll).uniq().value();

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
        [compositionRoot.metadata, metadataIds, metadataModelsSyncAll, onChange, remoteInstance, snackbar, syncRule]
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

    useEffect(() => {
        if (!_.isEmpty(metadataModelsSyncAll)) {
            compositionRoot.metadata.getByIds(syncRule.metadataIds, remoteInstance, "id").then(metadata => {
                const idsFromSyncAllMetadataTypes = _(metadata)
                    .pick(metadataModelsSyncAll)
                    .values()
                    .compact()
                    .flatten()
                    .map(entity => entity.id)
                    .value();

                setIdsToIgnore(idsFromSyncAllMetadataTypes);
            });
        } else {
            setIdsToIgnore([]);
        }
    }, [compositionRoot.metadata, metadataModelsSyncAll, remoteInstance, syncRule.metadataIds]);

    const notifyNewModel = useCallback(model => {
        setModel(() => model);
    }, []);

    const notifyModelSyncAllChange = useCallback(
        (value: boolean) => {
            setMetadataModelsSyncAll(types => {
                const modelName = model.getCollectionName();
                const syncAllTypes = value ? _.uniq(types.concat(modelName)) : _.without(types, modelName);
                const ruleTypes = _.uniq(syncRule.metadataTypes.concat(syncAllTypes));

                onChange(syncRule.updateMetadataTypes(ruleTypes).updateMetadataModelsSyncAll(syncAllTypes));

                return syncAllTypes;
            });
        },
        [model, syncRule, onChange]
    );

    //TODO: Go in direction of useHooks 963#discussion_r1682397641
    const modelIsSyncAll = useMemo(
        () => metadataModelsSyncAll.includes(model.getCollectionName()),
        [metadataModelsSyncAll, model]
    );

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
            notifyModelSyncAllChange={notifyModelSyncAllChange}
            modelIsSyncAll={modelIsSyncAll}
            ignoreIds={idsToIgnore}
        />
    );
}
