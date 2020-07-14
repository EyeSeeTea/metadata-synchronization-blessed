import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { Module } from "../entities/Module";
import { Package } from "../../packages/entities/Package";

export class DownloadModuleSnapshotUseCase implements UseCase {
    constructor(
        private downloadRepository: DownloadRepository,
        private instanceRepository: InstanceRepository
    ) {}

    public async execute(module: Module, contents: MetadataPackage) {
        const user = await this.instanceRepository.getUser();
        const item = Package.build({
            module,
            lastUpdatedBy: user,
            user,
        });

        const ruleName = _.kebabCase(_.toLower(module.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `snapshot-${ruleName}-${module.type}-${date}.json`;
        const payload = { package: item, ...contents };
        return this.downloadRepository.downloadFile(name, payload);
    }
}
