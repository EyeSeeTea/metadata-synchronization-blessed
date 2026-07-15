import { sync } from "./helpers";

describe("API 38", () => {
    describe("Transformation 2.36 -> 2.38", () => {
        it("Add userRole under ", async () => {
            const metadata = {
                users: [
                    {
                        lastUpdated: "2022-10-26T11:54:47.609",
                        id: "smGarTiKDdV",
                        created: "2022-10-05T18:11:58.024",
                        name: "user dev",
                        displayName: "user dev",
                        userCredentials: {
                            lastUpdated: "2022-12-16T08:11:55.139",
                            id: "BOStb17mnLk",
                            created: "2022-10-26T11:54:47.511",
                            name: "user dev",
                            userInfo: {
                                id: "smGarTiKDdV",
                            },
                            userRoles: [
                                {
                                    id: "tSW68qJAEhW",
                                },
                            ],
                        },
                    },
                ],
            };

            const { users } = await sync({
                from: "2.36",
                to: "2.38",
                metadata,
                models: ["users"],
            });

            const rolesUnderCredentials = users["smGarTiKDdV"].userCredentials.userRoles as any[];
            const rolesUnderRoot = users["smGarTiKDdV"].userRoles as any[];

            expect(rolesUnderCredentials).toEqual(rolesUnderRoot);
        });
    });
});

export {};
