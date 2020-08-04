import i18n from "../../../locales";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Repositories } from "../../Repositories";
import { Instance } from "../entities/Instance";
import { InstanceRepositoryConstructor } from "../repositories/InstanceRepository";

export class ValidateInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    public async execute(instance: Instance): Promise<Either<string, void>> {
        try {
            if (!instance.username || !instance.password) {
                return Either.error(
                    i18n.t("You need to provide a username and password combination")
                );
            }

            const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
                Repositories.InstanceRepository,
                [instance, ""]
            );

            const version = await instanceRepository.getVersion();

            if (version) {
                return Either.success(undefined);
            } else {
                return Either.error(i18n.t("Not a valid DHIS2 instance"));
            }
        } catch (error) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        return Either.error(i18n.t("Wrong username/password"));
                    case 404:
                        return Either.error(i18n.t("Wrong URL endpoint"));
                    default:
                        return Either.error(
                            i18n.t("Error {{status}}", { status: error.response.status })
                        );
                }
            } else if (error.request) {
                return Either.error(
                    i18n.t("Network error {{error}}, check if server is up and CORS is enabled", {
                        error: error.toString(),
                    })
                );
            } else {
                console.debug({ error });
                return Either.error(i18n.t("Unknown error"));
            }
        }
    }
}
