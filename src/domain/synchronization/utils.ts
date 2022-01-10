import _ from "lodash";
import { DataValue } from "../aggregated/entities/DataValue";
import { ProgramEvent } from "../events/entities/ProgramEvent";

export function buildMetadataDictionary(metadataPackage: Record<string, any[] | undefined>) {
    return _(metadataPackage)
        .values()
        .flatten()
        .tap(array => {
            const dataSetElements = _.flatten(
                _.map(metadataPackage.dataSets ?? [], e =>
                    _.map(e.dataSetElements ?? [], ({ dataElement }) => dataElement)
                )
            );

            const groupDataElements = _.flatten(
                _.map(metadataPackage.dataElementGroups ?? [], e => e.dataElements ?? [])
            );

            const groupSetDataElements = _.flatten(
                _.map(metadataPackage.dataElementGroupSets ?? [], e =>
                    _.flatten(_.map(e.dataElementGroups ?? [], ({ dataElements }) => dataElements))
                )
            );

            array.push(...dataSetElements, ...groupDataElements, ...groupSetDataElements);
        })
        .keyBy("id")
        .value();
}

export function cleanObjectDefault(object: ProgramEvent, defaults: string[]): ProgramEvent;
export function cleanObjectDefault(object: DataValue, defaults: string[]): DataValue;
export function cleanObjectDefault(object: ProgramEvent | DataValue, defaults: string[]) {
    return _.pickBy(object, value => !defaults.includes(String(value)));
}

export function stripUndefined<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function cleanOrgUnitPath(orgUnitPath?: string): string {
    return _(orgUnitPath).split("/").last() ?? "";
}

export function cleanOrgUnitPaths(orgUnitPaths: string[]): string[] {
    return orgUnitPaths.map(cleanOrgUnitPath);
}
