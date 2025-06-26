import { MetadataEntities } from "../domain/metadata/entities/MetadataEntities";
import { SynchronizationReport } from "../domain/reports/entities/SynchronizationReport";

export interface ExportBuilder {
    type: keyof MetadataEntities;
    ids: string[];
    excludeRules: string[][];
    includeReferencesAndObjectsRules: string[][];
    includeSharingSettingsObjectsAndReferences: boolean;
    includeOnlySharingSettingsReferences: boolean;
    includeUsersObjectsAndReferences: boolean;
    includeOnlyUsersReferences: boolean;
    includeOrgUnitsObjectsAndReferences: boolean;
    includeOnlyOrgUnitsReferences: boolean;
    sharingSettingsIncludeReferencesAndObjectsRules: string[][];
    usersIncludeReferencesAndObjectsRules: string[][];
    removeUserNonEssentialObjects: boolean;
}

export interface SynchronizationState {
    message?: string;
    syncReport?: SynchronizationReport;
    done?: boolean;
}
