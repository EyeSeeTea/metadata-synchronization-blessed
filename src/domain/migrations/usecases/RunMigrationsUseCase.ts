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
                    `Your current DHIS2 version is {{version}}. This version does not come with share settings in the data store and, in consequence, there are not sharing settings for each instance. This is a potential risk and we highly recommend you to update your DHIS2 version.`,
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
