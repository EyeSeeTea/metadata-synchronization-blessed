import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Package } from "../../packages/entities/Package";
import { Module } from "../entities/Module";

export class DownloadModuleSnapshotUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(module: Module, contents: MetadataPackage) {
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

        return this.repositoryFactory.downloadRepository().downloadFile(name, payload);
    }
}
