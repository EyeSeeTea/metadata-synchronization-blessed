import _ from "lodash";
import moment from "moment";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Package } from "../../packages/entities/Package";
import { Module } from "../entities/Module";

export class DownloadModuleSnapshotUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(module: Module, contents: MetadataPackage) {
        const user = await this.instanceRepository(this.localInstance).getUser();
        const item = Package.build({
            module,
            lastUpdatedBy: user,
            user,
        });

        const ruleName = _.kebabCase(_.toLower(module.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `snapshot-${ruleName}-${module.type}-${date}.json`;
        const payload = { package: item, ...contents };
        return this.downloadRepository().downloadFile(name, payload);
    }
}
