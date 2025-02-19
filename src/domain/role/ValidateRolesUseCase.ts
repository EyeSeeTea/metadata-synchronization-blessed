import { UseCase } from "../common/entities/UseCase";
import { AppRoles } from "./AppRoles";
import { Role } from "./Role";
import { RoleRepository } from "./RoleRepository";

export class ValidateRolesUseCase implements UseCase {
    constructor(private roleRepository: RoleRepository) {}

    public async execute(): Promise<void> {
        for (const role in AppRoles) {
            const { name, description, initialize } = AppRoles[role];

            if (initialize) {
                const role = await this.roleRepository.getByName(name);

                if (!role) {
                    const role = Role.createRole({ name, description });

                    await this.roleRepository.save(role);
                }
            }
        }
    }
}
