import _ from "lodash";
import { cache } from "../../../utils/cache";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ReceivedPullRequestNotification } from "../../notifications/entities/PullRequestNotification";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class SetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(responsible: MetadataResponsible): Promise<void> {
        const { id, users, userGroups } = responsible;

        if (users.length === 0 && userGroups.length === 0) {
            await this.storageRepository.removeObjectInCollection(Namespace.RESPONSIBLES, id);
        } else {
            await this.storageRepository.saveObjectInCollection(
                Namespace.RESPONSIBLES,
                responsible
            );
        }

        await this.updatePendingPullRequests(responsible);
    }

    @cache()
    private get storageRepository() {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );
    }

    private async updatePendingPullRequests({
        id,
        users,
        userGroups,
    }: MetadataResponsible): Promise<void> {
        const notifications = await this.storageRepository.listObjectsInCollection<
            ReceivedPullRequestNotification
        >(Namespace.NOTIFICATIONS);

        const relatedPullRequests = notifications.filter(
            ({ type, selectedIds }) => type === "received-pull-request" && selectedIds.includes(id)
        );

        await promiseMap(relatedPullRequests, async notification => {
            const newNotification: ReceivedPullRequestNotification = {
                ...notification,
                read: false,
                users: _.uniqBy([...notification.users, ...users], "id"),
                userGroups: _.uniqBy([...notification.userGroups, ...userGroups], "id"),
            };

            await this.storageRepository.saveObjectInCollection(
                Namespace.NOTIFICATIONS,
                newNotification
            );
        });
    }
}
