import { FutureData } from "../../common/entities/Future";
import { Instance } from "../entities/Instance";

export type InstanceValidationResponse = {
    version?: string;
};

export interface InstanceValidator {
    ping(instance: Instance): FutureData<InstanceValidationResponse>;
}
