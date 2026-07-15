import { FutureData } from "../../domain/common/entities/Future";
import { Instance } from "../../domain/instance/entities/Instance";
import { InstanceValidationResponse, InstanceValidator } from "../../domain/instance/repositories/InstanceValidator";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { apiToFuture } from "../common/utils/api-futures";

export class InstanceD2Validator implements InstanceValidator {
    constructor(private localIntance: Instance) {}

    ping(instance: Instance): FutureData<InstanceValidationResponse> {
        const d2Api = getD2APiFromInstance(this.localIntance, instance);

        const response = apiToFuture(d2Api.system.info).map(data => ({
            version: data.version,
        }));

        return response;
    }
}
