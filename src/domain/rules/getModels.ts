import _ from "lodash";
import { modelFactory } from "../../models/dhis/factory";
import { MetadataEntity, MetadataPackage } from "../metadata/entities/MetadataEntities";

export function getModelsByMetadataAndSyncAll(
    metadata: MetadataPackage<MetadataEntity>,
    metadataModelsSyncAll: string[]
) {
    return _(metadata)
        .keys()
        .concat(metadataModelsSyncAll)
        .sort()
        .uniq()
        .value()
        .map(type => modelFactory(type));
}
