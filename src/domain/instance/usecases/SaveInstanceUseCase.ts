import { Namespace } from "../../../data/storage/Namespaces";
import i18n from "../../../locales";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance, InstanceData } from "../entities/Instance";

export class SaveInstanceUseCase implements UseCase {
    constructor(
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        private encryptionKey: string
    ) {}

    public async execute(instance: Instance): Promise<ValidationError[]> {
        // Find for other existing instance with same name
        const existingInstances = await this.repositoryFactory
            .storageRepository(this.localInstance)
            .getObject<InstanceData[]>(Namespace.INSTANCES);

        const sameNameInstance = existingInstances?.find(
            ({ name, id }) => id !== instance.id && name === instance.name
        );

        if (sameNameInstance) {
            return [
                {
                    property: "name",
                    error: "name_exists",
                    description: i18n.t("An instance with this name already exists"),
                },
            ];
        }

        // Validate model and save it if there're no errors
        const modelValidations = instance.validate();
        if (modelValidations.length > 0) return modelValidations;

        const instanceData = {
            ...instance.encryptPassword(this.encryptionKey).toObject(),
            url: instance.type === "local" ? "" : instance.url,
            version: await this.getVersion(instance),
        };

        await this.repositoryFactory
            .storageRepository(this.localInstance)
            .saveObjectInCollection(Namespace.INSTANCES, instanceData);

        return [];
    }

    private async getVersion(instance: Instance): Promise<string | undefined> {
        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return version;
        } catch (error) {
            return instance.version;
        }
    }
}
