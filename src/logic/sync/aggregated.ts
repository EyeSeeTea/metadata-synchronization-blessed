import _ from "lodash";
import memoize from "nano-memoize";
import Instance from "../../models/instance";
import {
    getAggregatedData,
    postAggregatedData,
    cleanDataImportResponse,
} from "../../utils/synchronization";
import { GenericSync } from "./generic";
import { DataImportResponse } from "../../types/d2";
import { DataValue } from "../../types/synchronization";

export class AggregatedSync extends GenericSync {
    protected readonly type = "aggregated";

    protected buildPayload = memoize(async () => {
        const { dataParams = {} } = this.builder;
        const {
            dataSets = [],
            dataElementGroups = [],
            dataElementGroupSets = [],
            dataElements = [],
        } = await this.extractMetadata();

        const dataSetIds = dataSets.map(({ id }) => id);
        const dataElementGroupIds = dataElementGroups.map(({ id }) => id);
        const dataElementGroupSetIds = dataElementGroupSets.map(({ dataElementGroups }) =>
            dataElementGroups.map(({ id }: any) => id)
        );

        // Retrieve direct data values from dataSets and dataElementGroups
        //@ts-ignore
        const { dataValues: directDataValues = [] } = await getAggregatedData(
            this.api,
            dataParams,
            dataSetIds,
            _([...dataElementGroupIds, ...dataElementGroupSetIds])
                .flatten()
                .uniq()
                .value()
        );

        // Retrieve candidate data values from dataElements
        //@ts-ignore
        const { dataValues: candidateDataValues = [] } = await getAggregatedData(
            this.api,
            dataParams,
            dataElements.map(de => de.dataSetElements.map((dse: any) => dse.dataSet.id)),
            dataElements.map(de => de.dataElementGroups.map((deg: any) => deg.id))
        );

        // Retrieve indirect data values from dataElements
        const indirectDataValues = _.filter(candidateDataValues, ({ dataElement }) =>
            _.find(dataElements, { id: dataElement })
        );

        const dataValues = _.uniqWith(
            [...directDataValues, ...indirectDataValues],
            _.isEqual
        ) as DataValue[];

        return { dataValues };
    });

    protected async postPayload(instance: Instance) {
        const { dataParams = {} } = this.builder;

        const payloadPackage = await this.buildPayload();

        return postAggregatedData(instance, payloadPackage, dataParams);
    }

    protected cleanResponse(response: DataImportResponse, instance: Instance) {
        return cleanDataImportResponse(response, instance);
    }
}
