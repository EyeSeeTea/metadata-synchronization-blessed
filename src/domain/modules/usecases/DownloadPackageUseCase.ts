import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { Package } from "../entities/Package";

export class DownloadPackageUseCase implements UseCase {
    constructor(private downloadRepository: DownloadRepository) {}

    public async execute({ contents, ...item }: Package) {
        const ruleName = _.kebabCase(_.toLower(item.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `package-${ruleName}-${date}.json`;
        const payload = { package: item, ...contents };
        return this.downloadRepository.downloadFile(name, payload);
    }
}
