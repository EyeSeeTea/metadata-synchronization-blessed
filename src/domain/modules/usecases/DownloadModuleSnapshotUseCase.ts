import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Package } from "../../packages/entities/Package";
import { Repositories } from "../../Repositories";
import { DownloadRepositoryConstructor } from "../../storage/repositories/DownloadRepository";
import { Module } from "../entities/Module";

export class DownloadModuleSnapshotUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(module: Module, contents: MetadataPackage) {
        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const downloadRepository = this.repositoryFactory.get<DownloadRepositoryConstructor>(
            Repositories.DownloadRepository,
            []
        );

        const user = await instanceRepository.getUser();
        const item = Package.build({
            module,
            lastUpdatedBy: user,
            user,
        });

        const ruleName = _.kebabCase(_.toLower(module.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `snapshot-${ruleName}-${module.type}-${date}.json`;
        const payload = { package: item, ...contents };
        return downloadRepository.downloadFile(name, payload);
    }
}
