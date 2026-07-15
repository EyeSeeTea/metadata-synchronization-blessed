import { WmrDataSet } from "../../domain/entities/wmr/entities/WmrDataSet";
import { WmrDataSetRepository } from "../../domain/entities/wmr/repositories/WmrDataSetRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { dataSetFields } from "./WmrSettingsD2Repository";

export class WmrDataSetD2Repository implements WmrDataSetRepository {
    private api: D2Api;
    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(this.instance);
    }

    async getById(id: string): Promise<WmrDataSet> {
        const response = await this.api.models.dataSets
            .get({
                filter: { id: { eq: id } },
                fields: { ...dataSetFields, organisationUnits: { id: true, displayName: true, path: true } },
            })
            .getData();
        const dataSet = response.objects[0];
        if (!dataSet) throw new Error(`Data set not found: ${id}`);
        return {
            id: dataSet.id,
            name: dataSet.displayName,
            dataElements: dataSet.dataSetElements.map(({ dataElement }) => ({
                id: dataElement.id,
                name: dataElement.displayName,
            })),
            orgUnits: dataSet.organisationUnits.map(ou => ({ id: ou.id, name: ou.displayName, path: ou.path })),
        };
    }
}
