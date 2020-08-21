import { SynchronizationBuilder } from "../../../types/synchronization";
import { SharedRef } from "../../common/entities/Ref";
import { SynchronizationType } from "./SynchronizationType";

export interface SynchronizationRule extends SharedRef {
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    enabled: boolean;
    lastExecuted?: Date;
    frequency?: string;
    type: SynchronizationType;
}
