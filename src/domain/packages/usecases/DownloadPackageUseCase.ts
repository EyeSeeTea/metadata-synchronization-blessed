import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { DownloadRepositoryConstructor } from "../../storage/repositories/DownloadRepository";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class DownloadPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string, instance = this.localInstance) {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );

        const downloadRepository = this.repositoryFactory.get<DownloadRepositoryConstructor>(
            Repositories.DownloadRepository,
            []
        );

        const element = await storageRepository.getObjectInCollection<Package>(
            Namespace.PACKAGES,
            id
        );
        if (!element) throw new Error("Couldn't find package");

        const { contents, ...item } = element;
        const ruleName = _.kebabCase(_.toLower(item.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `package-${ruleName}-${date}.json`;
        const payload = { package: item, ...contents };
        downloadRepository.downloadFile(name, payload);
    }
}
