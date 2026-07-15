import { mock, when, anything, instance } from "ts-mockito";
import { ListInstancesUseCase } from "../ListInstancesUseCase";
import { InstanceRepository } from "../../repositories/InstanceRepository";
import { UserRepository } from "../../../user/repositories/UserRepository";
import { Instance } from "../../entities/Instance";
import { User } from "../../../user/entities/User";

describe("ListInstancesUseCase", () => {
    describe("when user is global admin", () => {
        it("should return all instances including those without permissions", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: true,
                isAppConfigurator: true,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(3); // LOCAL + 2 instances
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).toContain("instance2");
        });
    });

    describe("when user is owner", () => {
        it("should return instances where user is the owner", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "user1", name: "User 1" },
                    publicAccess: "--------",
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(2); // LOCAL + instance1
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).not.toContain("instance2");
        });
    });

    describe("when user has user access permissions", () => {
        it("should return instances with user access permissions", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                    userAccesses: [
                        {
                            id: "user1",
                            access: "r-------",
                            displayName: "User 1",
                        },
                    ],
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                    userAccesses: [
                        {
                            id: "otherUser",
                            access: "r-------",
                            displayName: "Other User",
                        },
                    ],
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(2); // LOCAL + instance1
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).not.toContain("instance2");
        });
    });

    describe("when user has user group access permissions", () => {
        it("should return instances with user group access permissions", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
                userGroups: [
                    { id: "group1", name: "Group 1" },
                    { id: "group2", name: "Group 2" },
                ],
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                    userGroupAccesses: [
                        {
                            id: "group1",
                            access: "r-------",
                            displayName: "Group 1",
                        },
                    ],
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                    userGroupAccesses: [
                        {
                            id: "group3",
                            access: "r-------",
                            displayName: "Group 3",
                        },
                    ],
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(2); // LOCAL + instance1
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).not.toContain("instance2");
        });
    });

    describe("when instance has public read access", () => {
        it("should return instances with public read access", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "r-------",
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(2); // LOCAL + instance1
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).not.toContain("instance2");
        });
    });

    describe("when user has no permissions", () => {
        it("should return only LOCAL instance", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                },
                {
                    id: "instance2",
                    name: "Instance 2",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(1); // Only LOCAL
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).not.toContain("instance1");
            expect(result.map(i => i.id)).not.toContain("instance2");
        });
    });

    describe("when user is not app configurator", () => {
        it("should return only LOCAL instance even with permissions", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: false,
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1",
                    user: { id: "user1", name: "User 1" },
                    publicAccess: "r-------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(1); // Only LOCAL
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).not.toContain("instance1");
        });
    });

    describe("when combining multiple permission types", () => {
        it("should return instances with any valid permission", async () => {
            const user = givenAUser({
                id: "user1",
                isGlobalAdmin: false,
                isAppConfigurator: true,
                userGroups: [{ id: "group1", name: "Group 1" }],
            });

            const instances = givenInstances([
                {
                    id: "instance1",
                    name: "Instance 1 - Owner",
                    user: { id: "user1", name: "User 1" },
                    publicAccess: "--------",
                },
                {
                    id: "instance2",
                    name: "Instance 2 - User Access",
                    user: { id: "otherUser", name: "Other User" },
                    publicAccess: "--------",
                    userAccesses: [
                        {
                            id: "user1",
                            access: "r-------",
                            displayName: "User 1",
                        },
                    ],
                },
                {
                    id: "instance3",
                    name: "Instance 3 - Group Access",
                    user: { id: "otherUser2", name: "Other User 2" },
                    publicAccess: "--------",
                    userGroupAccesses: [
                        {
                            id: "group1",
                            access: "r-------",
                            displayName: "Group 1",
                        },
                    ],
                },
                {
                    id: "instance4",
                    name: "Instance 4 - Public Access",
                    user: { id: "otherUser3", name: "Other User 3" },
                    publicAccess: "r-------",
                },
                {
                    id: "instance5",
                    name: "Instance 5 - No Access",
                    user: { id: "otherUser4", name: "Other User 4" },
                    publicAccess: "--------",
                },
            ]);

            const useCase = createUseCase(user, instances);

            const result = await useCase.execute();

            expect(result).toHaveLength(5); // LOCAL + 4 instances with access
            expect(result.map(i => i.id)).toContain("LOCAL");
            expect(result.map(i => i.id)).toContain("instance1");
            expect(result.map(i => i.id)).toContain("instance2");
            expect(result.map(i => i.id)).toContain("instance3");
            expect(result.map(i => i.id)).toContain("instance4");
            expect(result.map(i => i.id)).not.toContain("instance5");
        });
    });

    function givenAUser(overrides: Partial<User>): User {
        return {
            id: "user1",
            name: "User 1",
            email: "user1@example.com",
            username: "user1",
            userGroups: [],
            organisationUnits: [],
            dataViewOrganisationUnits: [],
            isGlobalAdmin: false,
            isAppConfigurator: false,
            isAppExecutor: false,
            ...overrides,
        };
    }

    function givenInstances(
        instancesData: Array<{
            id: string;
            name: string;
            user: { id: string; name: string };
            publicAccess: string;
            userAccesses?: Array<{ id: string; access: string; displayName: string }>;
            userGroupAccesses?: Array<{ id: string; access: string; displayName: string }>;
        }>
    ): Instance[] {
        return instancesData.map(data =>
            Instance.build({
                id: data.id,
                name: data.name,
                type: "dhis",
                url: `http://${data.id}.example.com`,
                username: "admin",
                password: "password",
                user: data.user,
                publicAccess: data.publicAccess,
                userAccesses: data.userAccesses || [],
                userGroupAccesses: data.userGroupAccesses || [],
            })
        );
    }

    function createUseCase(user: User, instances: Instance[]): ListInstancesUseCase {
        const mockedInstanceRepository = mock<InstanceRepository>();
        const mockedUserRepository = mock<UserRepository>();
        const localInstance = Instance.build({
            id: "LOCAL",
            name: "Local Instance",
            type: "local",
            url: "http://localhost:8080",
        });

        when(mockedUserRepository.getCurrent()).thenResolve(user);

        when(mockedInstanceRepository.getAll(anything())).thenCall(() => {
            const allInstances = instances.some(i => i.id === "LOCAL") ? [...instances] : [localInstance, ...instances];

            return Promise.resolve(allInstances);
        });

        return new ListInstancesUseCase(instance(mockedUserRepository), instance(mockedInstanceRepository));
    }
});
