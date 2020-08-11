import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Package } from "../entities/Package";

export class ListStorePackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(): Promise<Package[]> {
        console.log(this.repositoryFactory, this.localInstance);
        return [];
    }
}
