import { UseCase } from "../../common/entities/UseCase";
import { Instance } from "../entities/Instance";

export class GetLocalInstanceUseCase implements UseCase {
    constructor(private localInstance: Instance) {}

    // TODO
    public async execute(): Promise<Instance> {
        return this.localInstance;
    }
}
