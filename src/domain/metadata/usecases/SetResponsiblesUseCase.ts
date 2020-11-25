import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { ReceivedPullRequestNotification } from "../../notifications/entities/PullRequestNotification";
import { MetadataResponsible } from "../entities/MetadataResponsible";

export class SetResponsiblesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(responsible: MetadataResponsible): Promise<void> {
        const { id, users, userGroups } = responsible;

        if (users.length === 0 && userGroups.length === 0) {
            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .removeObjectInCollection(Namespace.RESPONSIBLES, id);
        } else {
            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .saveObjectInCollection(Namespace.RESPONSIBLES, responsible);
        }

        await this.updatePendingPullRequests(responsible);
    }

    private async updatePendingPullRequests({
        id,
        users,
        userGroups,
    }: MetadataResponsible): Promise<void> {
        const notifications = await this.repositoryFactory
            .storageRepository(this.localInstance)
            .listObjectsInCollection<ReceivedPullRequestNotification>(Namespace.NOTIFICATIONS);

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

            await this.repositoryFactory
                .storageRepository(this.localInstance)
                .saveObjectInCollection(Namespace.NOTIFICATIONS, newNotification);
        });
    }
}
