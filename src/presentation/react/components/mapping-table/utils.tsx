import _ from "lodash";
import { D2Model } from "../../../../models/dhis/default";
import { MetadataType } from "../../../../utils/d2";

export const EXCLUDED_KEY = "DISABLED";

export const cleanNestedMappedId = (id: string): string => {
    return _(id).split("-").last() ?? "";
};

export const getChildrenRows = (rows: MetadataType[], model: typeof D2Model): MetadataType[] => {
    const childrenKeys = model.getChildrenKeys() ?? [];

    return _.flattenDeep(
        rows.map(row => Object.values(_.pick(row, childrenKeys)) as MetadataType[])
    );
};
