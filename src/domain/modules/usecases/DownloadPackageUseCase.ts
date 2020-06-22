import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class DownloadPackageUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private downloadRepository: DownloadRepository
    ) {}

    public async execute(id: string) {
        const element = await this.storageRepository.getObjectInCollection<Package>(
            Namespace.PACKAGES,
            id
        );
        if (!element) throw new Error("Couldn't find package");

        const { contents, ...item } = element;
        const ruleName = _.kebabCase(_.toLower(item.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `package-${ruleName}-${date}.json`;
        const payload = { package: item, ...contents };
        this.downloadRepository.downloadFile(name, payload);
    }
}
