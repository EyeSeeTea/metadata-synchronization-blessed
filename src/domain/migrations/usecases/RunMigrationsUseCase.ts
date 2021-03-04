import i18n from "../../../locales";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Debug } from "../entities/Debug";

export class RunMigrationsUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(debug: Debug): Promise<void> {
        // TODO: Move to a new permissions repository
        const api = getD2APiFromInstance(this.localInstance);
        const currentUser = await api.currentUser.get({ fields: { authorities: true } }).getData();

        if (!this.localInstance.existsShareSettingsInDataStore) {
            debug({
                message: i18n.t(
                    `Your current dhis2 version is {{version}} and does not exist share settings for instances. This is a potencial risk!`,
                    { version: this.localInstance.version }
                ),
                level: "warning",
            });
        }

        if (!currentUser.authorities.includes("ALL")) {
            throw new Error("Only a user with authority ALL can run this migration");
        }

        await this.repositoryFactory.migrationsRepository(this.localInstance).runMigrations(debug);
    }
}
