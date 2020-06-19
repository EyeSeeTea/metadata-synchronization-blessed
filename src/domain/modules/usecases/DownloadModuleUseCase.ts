import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { Module } from "../entities/Module";

export class DownloadModuleUseCase implements UseCase {
    constructor(private downloadRepository: DownloadRepository) {}

    public async execute(module: Module) {
        const ruleName = _.kebabCase(_.toLower(module.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `module-${ruleName}-${module.type}-${date}.json`;
        return this.downloadRepository.downloadFile(name, module);
    }
}
