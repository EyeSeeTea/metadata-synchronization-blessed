import _ from "lodash";
import moment from "moment";
import { Namespace } from "../../../data/storage/Namespaces";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { BasePackage } from "../entities/Package";

export class DownloadPackageUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(storeId: string | undefined, id: string, instance = this.localInstance) {
        const element = storeId
            ? await this.getStorePackage(storeId, id)
            : await this.getDataStorePackage(id, instance);
        if (!element) throw new Error("Couldn't find package");

        const { contents, ...item } = element;
        const ruleName = _.kebabCase(_.toLower(item.name));
        const date = moment().format("YYYYMMDDHHmm");
        const name = `package-${ruleName}-${date}.json`;
        const payload = { package: item, ...contents };
        this.downloadRepository().downloadFile(name, payload);
    }

    private async getDataStorePackage(id: string, instance: Instance) {
        return this.storageRepository(instance).getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            id
        );
    }

    private async getStorePackage(storeId: string, url: string) {
        const store = await this.storeRepository(this.localInstance).getById(storeId);
        if (!store) return undefined;

        const { encoding, content } = await this.gitRepository().request<{
            encoding: string;
            content: string;
        }>(store, url);

        const validation = this.gitRepository().readFileContents<
            MetadataPackage & { package: BasePackage }
        >(encoding, content);
        if (!validation.value.data) return undefined;

        const { package: basePackage, ...contents } = validation.value.data;
        return { ...basePackage, contents };
    }
}
