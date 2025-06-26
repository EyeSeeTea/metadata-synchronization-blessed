import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPayloadBuilder } from "../../metadata/builders/MetadataPayloadBuilder";
import { Package } from "../../packages/entities/Package";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { Module } from "../entities/Module";
export class DownloadModuleSnapshotUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private localInstance: Instance,
        private downloadRepository: DownloadRepository,
        private metadataPayloadBuilder: MetadataPayloadBuilder
    ) {}

    public async execute(module: Module, originInstance: string) {
        const contents = await this.metadataPayloadBuilder.build({
            ...module.toSyncBuilder(),
            originInstance,
            targetInstances: [],
        });

        const user = await this.repositoryFactory.userRepository(this.localInstance).getCurrent();
        const item = Package.build({
            module,
            lastUpdatedBy: { id: user.id, name: user.name },
            user,
        });

        const ruleName = _.kebabCase(_.toLower(module.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `snapshot-${ruleName}-${module.type}-${date}`;
        const payload = { package: item, ...contents };

        return this.downloadRepository.downloadFile(name, payload);
    }
}
