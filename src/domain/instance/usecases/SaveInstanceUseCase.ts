import i18n from "../../../locales";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class SaveInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(instance: Instance): Promise<ValidationError[]> {
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);

        const instanceByName = await instanceRepository.getByName(instance.name);

        if (instanceByName && instanceByName.id !== instance.id) {
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

        const editedInstance = instance.update({ version: await this.getVersion(instance) });

        await instanceRepository.save(editedInstance);

        return [];
    }

    private async getVersion(instance: Instance): Promise<string | undefined> {
        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();
            return version;
        } catch (error: any) {
            return instance.version;
        }
    }
}
