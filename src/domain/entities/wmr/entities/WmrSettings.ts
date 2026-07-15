import { Maybe } from "../../../../types/utils";
import { NamedRef } from "../../../common/entities/Ref";
import { Id } from "../../../common/entities/Schemas";

export type DataSetAttrs = NamedRef & { dataElements: NamedRef[]; orgUnits: NamedRef[] };
export type WmrSettingsAttrs = {
    countryDataSetId: Id;
    dataSets: DataSetAttrs[];
    countryDataElementsIds: Id[];
};

export class WmrSettings {
    public readonly dataSets: DataSetAttrs[];
    public readonly countryDataSetId: Id;
    public readonly countryDataElementsIds: Id[];
    public static readonly LOCAL_INSTANCE_ID = "LOCAL";

    constructor(attrs: WmrSettingsAttrs) {
        this.dataSets = attrs.dataSets;
        this.countryDataSetId = attrs.countryDataSetId;
        this.countryDataElementsIds = attrs.countryDataElementsIds;
    }

    public getDataElementsIds(dataSetId: Maybe<Id>): Id[] {
        const dataSet = this.dataSets.find(dataSet => dataSet.id === dataSetId);
        if (!dataSetId) return [];
        if (!dataSet) return [];

        return dataSet.dataElements.map(dataElement => dataElement.id);
    }
}
