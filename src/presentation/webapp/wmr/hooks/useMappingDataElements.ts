import _ from "lodash";
import React from "react";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Id } from "../../../../domain/common/entities/Schemas";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { WmrSettings } from "../../../../domain/entities/wmr/entities/WmrSettings";
import { WmrDataSet } from "../../../../domain/entities/wmr/entities/WmrDataSet";

export function useGetDataSetOrgUnits(props: { id: Id }) {
    const { compositionRoot } = useAppContext();
    const [dataSet, setDataSet] = React.useState<WmrDataSet>();
    const loading = useLoading();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        async function getInstance() {
            loading.show();
            const dataSet = await compositionRoot.wmr.getDataSetById(props.id);
            setDataSet(dataSet);
            loading.hide();
        }

        getInstance();
    }, [compositionRoot, loading, snackbar, props.id]);

    return { dataSet };
}

export function useMappingDataElements(dataElementsFrom: "LOCAL" | "REMOTE") {
    const { compositionRoot } = useAppContext();
    const [dataElementsToMigrate, setDataElementsToMigrate] = React.useState<Id[]>([]);
    const loading = useLoading();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        async function getInstance() {
            loading.show();
            const instanceResult = await compositionRoot.instances.getById(WmrSettings.LOCAL_INSTANCE_ID);

            instanceResult.match({
                error: () => {
                    snackbar.error("Failed to load LOCAL instance");
                    loading.hide();
                },
                success: async instance => {
                    const dataSourceMapping = await compositionRoot.mapping.get({ type: "instance", id: instance.id });
                    const mapping = dataSourceMapping?.mappingDictionary ?? {};
                    const dataElementsIds =
                        dataElementsFrom === "LOCAL"
                            ? _(mapping.aggregatedDataElements).keys().value()
                            : _(mapping.aggregatedDataElements)
                                  .values()
                                  .map(mapping => mapping.mappedId)
                                  .compact()
                                  .value();
                    setDataElementsToMigrate(dataElementsIds);
                    loading.hide();
                },
            });
        }

        getInstance();
    }, [compositionRoot, dataElementsFrom, loading, snackbar]);

    return { dataElementsToMigrate };
}
