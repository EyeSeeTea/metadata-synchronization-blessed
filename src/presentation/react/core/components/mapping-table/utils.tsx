import _ from "lodash";
import { D2Model } from "../../../../../models/dhis/default";
import { MetadataType } from "../../../../../utils/d2";

export const EXCLUDED_KEY = "DISABLED";
export const MAPPED_BY_VALUE_KEY = "MAPPED_BY_VALUE";

export const cleanNestedMappedId = (id: string): string => {
    return _(id).split("-").last() ?? "";
};

export const getChildrenRows = (rows: MetadataType[], model: typeof D2Model): MetadataType[] => {
    const childrenKeys = model.getChildrenKeys() ?? [];

    return _.flattenDeep(rows.map(row => Object.values(_.pick(row, childrenKeys)) as MetadataType[]));
};

export const getAllChildrenRows = (rows: MetadataType[], model: typeof D2Model): MetadataType[] => {
    //TODO: realize this action for n levels dinamically

    const childrenKeys = model.getChildrenKeys() ?? [];

    const childrenLevel1 = _.flattenDeep(rows.map(row => Object.values(_.pick(row, childrenKeys)) as MetadataType[]));

    const childrenLevel2 = _.flattenDeep(
        childrenLevel1.map(row => Object.values(_.pick(row, childrenKeys)) as MetadataType[])
    );

    return [...childrenLevel1, ...childrenLevel2];
};
