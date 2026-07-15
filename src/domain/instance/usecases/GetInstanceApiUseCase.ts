import { D2Api } from "../../../types/d2-api";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { UseCase } from "../../common/entities/UseCase";
import { Instance } from "../entities/Instance";

/**
 * @deprecated - This use case should not exists. Use usecases and repositories instead d2api directly
 */
export class GetInstanceApiUseCase implements UseCase {
    constructor(private localInstance: Instance) {}

    public execute(instance = this.localInstance): D2Api {
        const api = getD2APiFromInstance(this.localInstance, instance);

        return api;
    }
}
