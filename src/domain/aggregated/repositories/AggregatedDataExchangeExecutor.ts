import { Instance } from "../../instance/entities/Instance";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";

export interface AggregatedDataExchangeExecutor {
    execute(aggregatedDataExchangeId: string, targetInstance: Instance): Promise<SynchronizationResult>;
}
