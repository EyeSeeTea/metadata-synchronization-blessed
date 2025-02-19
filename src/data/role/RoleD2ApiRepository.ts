import { Role } from "../../domain/role/Role";
import { RoleRepository } from "../../domain/role/RoleRepository";
import { D2Api } from "../../types/d2-api";

export class RoleD2ApiRepository implements RoleRepository {
    constructor(private api: D2Api) {}

    async getByName(name: string): Promise<Role | undefined> {
        const { userRoles } = await this.api.metadata
            .get({
                userRoles: {
                    fields: { id: true, name: true, publicAccess: true, description: true },
                    filter: { name: { eq: name } },
                    userRoles: true,
                },
            })
            .getData();

        const role = userRoles[0];

        if (role) {
            return Role.create(role);
        } else {
            return undefined;
        }
    }

    async save(role: Role): Promise<void> {
        await this.api.metadata
            .post({
                userRoles: [role._getAttributes()],
            })
            .getData();
    }
}
