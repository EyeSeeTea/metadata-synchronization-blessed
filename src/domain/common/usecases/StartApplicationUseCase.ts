import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../entities/UseCase";
import { RepositoryFactory } from "../factories/RepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";

export class StartApplicationUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<void> {
        await this.verifyLocalInstanceExists();
    }

    private async verifyLocalInstanceExists() {
        const storageClient = await this.repositoryFactory.configRepository(this.localInstance).getStorageClient();

        const objects = await storageClient.listObjectsInCollection<InstanceData>(Namespace.INSTANCES);

        if (objects.find(data => data.id === "LOCAL")) return;

        const localInstance = Instance.build({
            type: "local",
            id: "LOCAL",
            name: "This instance",
            url: "",
        }).toObject();

        await storageClient.saveObjectInCollection(Namespace.INSTANCES, localInstance);
    }
}
