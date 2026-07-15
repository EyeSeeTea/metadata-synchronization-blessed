import { NamedRef } from "../../../common/entities/Ref";
import { Id } from "../../../common/entities/Schemas";

type OrgUnitBasicInformation = NamedRef & { path: string };
export type WmrDataSetAttrs = NamedRef & { dataElements: NamedRef[]; orgUnits: OrgUnitBasicInformation[] };
export class WmrDataSet {
    public readonly id: Id;
    public readonly name: string;
    public readonly dataElements: NamedRef[];
    public readonly orgUnits: OrgUnitBasicInformation[];
    constructor(data: WmrDataSetAttrs) {
        this.id = data.id;
        this.name = data.name;
        this.dataElements = data.dataElements;
        this.orgUnits = data.orgUnits;
    }
}
