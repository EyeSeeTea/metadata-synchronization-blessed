import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../entities/UseCase";
import { DynamicRepositoryFactory } from "../factories/DynamicRepositoryFactory";
import { Instance, InstanceData } from "../../instance/entities/Instance";

export class StartApplicationUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<void> {
        await this.verifyLocalInstanceExists();
    }

    private async verifyLocalInstanceExists() {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

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
