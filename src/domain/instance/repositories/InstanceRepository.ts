import { D2Api } from "../../../types/d2-api";
import { OrganisationUnit } from "../../metadata/entities/MetadataEntities";
import { Instance } from "../entities/Instance";
import { InstanceMessage } from "../entities/Message";

export interface InstancesFilter {
    search?: string;
    ids?: string[];
}

export interface InstanceRepository {
    getAll(filter: InstancesFilter): Promise<Instance[]>;
    getById(id: string): Promise<Instance | undefined>;
    getByName(name: string): Promise<Instance | undefined>;
    getApi(): D2Api;
    getBaseUrl(): string;
    getVersion(): Promise<string>;
    getOrgUnitRoots(): Promise<Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]>;
    sendMessage(message: InstanceMessage): Promise<void>;
    save(instance: Instance): Promise<void>;
}
