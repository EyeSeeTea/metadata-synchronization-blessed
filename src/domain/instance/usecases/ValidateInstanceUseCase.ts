import i18n from "../../../locales";
import { debug } from "../../../utils/debug";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource, isJSONDataSource } from "../entities/DataSource";

export class ValidateInstanceUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    public async execute(instance: DataSource): Promise<Either<string, void>> {
        if (isJSONDataSource(instance)) return Either.success(undefined);

        try {
            const version = await this.repositoryFactory.instanceRepository(instance).getVersion();

            if (version) {
                return Either.success(undefined);
            } else if (!instance.username || !instance.password) {
                return Either.error(i18n.t("You need to provide a username and password combination"));
            } else {
                return Either.error(i18n.t("Not a valid DHIS2 instance"));
            }
        } catch (error: any) {
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        return Either.error(i18n.t("Wrong username/password"));
                    case 404:
                        return Either.error(i18n.t("Wrong URL endpoint"));
                    default:
                        return Either.error(i18n.t("Error {{status}}", { status: error.response.status }));
                }
            } else if (error.request) {
                return Either.error(i18n.t("Network error, check if server is up and CORS is enabled"));
            } else {
                debug({ error });
                return Either.error(i18n.t("Unknown error"));
            }
        }
    }
}
