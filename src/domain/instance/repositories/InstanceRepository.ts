import { D2Api } from "../../../types/d2-api";
import { OrganisationUnit } from "../../metadata/entities/MetadataEntities";
import { Instance } from "../entities/Instance";
import { User } from "../entities/User";

export interface InstanceRepository {
    getApi(): D2Api;
    getBaseUrl(): string;
    getUser(): Promise<User>;
    getVersion(): Promise<string>;
    getById(id: string): Promise<Instance>;
    getDefaultIds(filter?: string): Promise<string[]>;
    getOrgUnitRoots(): Promise<Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]>;
}
