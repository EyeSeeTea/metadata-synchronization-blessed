import { D2Api } from "../../../types/d2-api";
import { OrganisationUnit, UserGroup } from "../../metadata/entities/MetadataEntities";
import { Instance } from "../entities/Instance";
import { InstanceMessage } from "../entities/Message";
import { User } from "../entities/User";

export interface InstanceRepositoryConstructor {
    new (instance: Instance, encryptionKey: string): InstanceRepository;
}

export interface InstanceRepository {
    getApi(): D2Api;
    getBaseUrl(): string;
    getUser(): Promise<User>;
    getVersion(): Promise<string>;
    getOrgUnitRoots(): Promise<Pick<OrganisationUnit, "id" | "name" | "displayName" | "path">[]>;
    getUserGroups(): Promise<Pick<UserGroup, "id" | "name">[]>;
    sendMessage(message: InstanceMessage): Promise<void>;
}
