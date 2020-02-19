import { D2ModelSchemas } from "d2-api";
import _ from "lodash";
import Instance, { MetadataMapping } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { cleanOrgUnitPath } from "../../utils/synchronization";

export const autoMap = async (
    instance: Instance,
    type: keyof D2ModelSchemas,
    selectedItem: MetadataType
): Promise<string | undefined> => {
    const { [type]: candidates } = await instance
        .getApi()
        .metadata.get({
            [type]: {
                fields: { id: true, code: true },
                filter: {
                    name: { token: selectedItem.name },
                    shortName: { token: selectedItem.shortName },
                    id: { eq: selectedItem.id },
                    code: { eq: selectedItem.code },
                },
                rootJunction: "OR",
            },
        })
        .getData();

    const candidateWithSameId = _.find(candidates, ["id", selectedItem.id]);
    const candidateWithSameCode = _.find(candidates, ["code", selectedItem.code]);
    const candidate = candidateWithSameId ?? candidateWithSameCode ?? candidates[0];

    return candidate.id;
};

export const buildMapping = async (
    instance: Instance,
    type: keyof D2ModelSchemas,
    mappedId?: string
): Promise<MetadataMapping | undefined> => {
    const { [type]: results = [] } = mappedId
        ? await instance
              .getApi()
              .metadata.get({
                  [type]: {
                      fields: {
                          id: true,
                          name: true,
                          categoryOptions: { id: true },
                          optionSets: { id: true },
                          domainType: true,
                          aggregationType: true,
                          valueType: true,
                          zeroIsSignificant: true,
                      },
                      filter: {
                          id: {
                              eq: cleanOrgUnitPath(mappedId),
                          },
                      },
                  },
              })
              .getData()
        : {};

    if (!mappedId || results.length !== 1) return undefined;

    return {
        mappedId,
        name: results[0].name,
        hasWarnings: false,
        mapping: {},
    };
};
