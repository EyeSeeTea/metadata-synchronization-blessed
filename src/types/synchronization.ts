import { MetadataEntities } from "../domain/metadata/entities/MetadataEntities";
import { SynchronizationReport } from "../domain/reports/entities/SynchronizationReport";

export interface ExportBuilder {
    type: keyof MetadataEntities;
    ids: string[];
    excludeRules: string[][];
    includeReferencesAndObjectsRules: string[][];
    includeSharingSettings: boolean;
    removeOrgUnitReferences: boolean;
    removeUserObjectsAndReferences: boolean;
}

export interface SynchronizationState {
    message?: string;
    syncReport?: SynchronizationReport;
    done?: boolean;
}
