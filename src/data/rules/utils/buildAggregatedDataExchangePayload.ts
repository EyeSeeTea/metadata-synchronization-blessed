import { RuleAggregatedDataExchange } from "../../../domain/rules/value-object/RuleAggregatedDataExchange";
import {
    AggregatedDataExchange,
    MAX_ADEX_SOURCE_REQUEST_NAME_LENGTH,
} from "../../aggregated/models/AggregatedDataExchange";
import { InstanceDataStoreData } from "../../instance/InstanceD2ApiRepository";

export type AdexRequestDimensions = {
    periods: string[];
    orgUnits: string[];
    orgUnitCodes: string[];
    metadataIds: string[];
    metadataCodes: string[];
};

export function buildAggregatedDataExchangePayload(
    ade: RuleAggregatedDataExchange,
    ruleName: string,
    instance: InstanceDataStoreData | undefined,
    dimensions: AdexRequestDimensions
): AggregatedDataExchange {
    if (!instance) {
        throw new Error(
            `Cannot build aggregated data exchange payload for rule "${ruleName}": target instance "${ade.target.instanceId}" was not found (it may have been deleted).`
        );
    }

    const name = `${ruleName} target: ${instance.name || ""}`;
    const requestName = name.slice(0, MAX_ADEX_SOURCE_REQUEST_NAME_LENGTH);

    const isInternal = instance.exchangeTargetType === "internal";

    const scheme: "UID" | "CODE" = isInternal ? "UID" : "CODE";
    const dx = isInternal ? dimensions.metadataIds : dimensions.metadataCodes;
    const ou = isInternal ? dimensions.orgUnits : dimensions.orgUnitCodes;

    const request = {
        idScheme: scheme,
        dataElementIdScheme: scheme,
        orgUnitIdScheme: scheme,
        categoryOptionComboIdScheme: scheme,
    };

    const target = isInternal
        ? { type: "INTERNAL" as const, request }
        : {
              type: "EXTERNAL" as const,
              api: {
                  url: instance.url || "",
                  username: ade.target.username,
                  password: ade.target.password,
                  token: ade.target.token,
              },
              request,
          };

    return {
        id: ade.id,
        name,
        source: {
            requests: [
                {
                    name: requestName,
                    dx,
                    pe: dimensions.periods,
                    ou,
                    filters: [],
                    inputIdScheme: scheme,
                    outputIdScheme: scheme,
                    outputDataElementIdScheme: scheme,
                    outputOrgUnitIdScheme: scheme,
                },
            ],
        },
        target,
    };
}
