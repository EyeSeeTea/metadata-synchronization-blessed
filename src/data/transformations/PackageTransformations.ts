import { Transformation } from "../../domain/transformations/entities/Transformation";

export const metadataTransformations: Transformation[] = [
    {
        name: "add user roles under user directly",
        apiVersion: 38,
        apply: ({ users, ...rest }: any) => {
            return {
                ...rest,
                users: users?.map((user: any) => ({ ...user, userRoles: user.userCredentials.userRoles })) || undefined,
            };
        },
    },
];

export const aggregatedTransformations: Transformation[] = [];

export const eventsTransformations: Transformation[] = [];
