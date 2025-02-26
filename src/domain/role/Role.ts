import { generateUid } from "d2/uid";
import { NamedRef } from "../common/entities/Ref";
import { Struct } from "../common/entities/Struct";

export type RoleProps = {
    description: string;
    publicAccess: string;
} & NamedRef;

export class Role extends Struct<RoleProps>() {
    static createRole(props: Omit<RoleProps, "id" | "publicAccess">): Role {
        const id = generateUid();
        const publicAccess = "--------";

        return this.create({ id, publicAccess, ...props });
    }
}
