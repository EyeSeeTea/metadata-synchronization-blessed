import _ from "lodash";
import moment from "moment";
import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";
import { BasePackage } from "../entities/Package";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class DownloadPackageUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private githubRepository: GitHubRepository,
        private downloadRepository: DownloadRepository,
        private localInstance: Instance
    ) {}

    public async execute(storeId: string | undefined, id: string, instance = this.localInstance) {
        const element = storeId
            ? await this.getStorePackage(storeId, id)
            : await this.getDataStorePackage(id, instance);
        if (!element) throw new Error("Couldn't find package");

        const { contents, ...item } = element;
        const ruleName = _.kebabCase(_.toLower(item.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `package-${ruleName}-${date}`;
        const payload = { package: item, ...contents };

        this.downloadRepository.downloadFile(name, payload);
    }

    private async getDataStorePackage(id: string, instance: Instance) {
        const storageClient = await this.repositoryFactory.configRepository(instance).getStorageClientPromise();

        return storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, id);
    }

    private async getStorePackage(storeId: string, url: string) {
        const store = await this.repositoryFactory.storeRepository(this.localInstance).getById(storeId);
        if (!store) return undefined;

        const { encoding, content } = await this.githubRepository.request<{
            encoding: string;
            content: string;
        }>(store, url);

        const validation = this.githubRepository.readFileContents<MetadataPackage & { package: BasePackage }>(
            encoding,
            content
        );

        if (!validation.value.data) return undefined;

        const { package: basePackage, ...contents } = validation.value.data;
        return { ...basePackage, contents };
    }
}
