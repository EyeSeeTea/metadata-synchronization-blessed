import { Role } from "./Role";

export interface RoleRepository {
    getByName(name: string): Promise<Role | undefined>;
    save(role: Role): Promise<void>;
}
