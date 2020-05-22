import { PackageTransformationStrategy, mapPackageToD2Version } from "../D2VersionPackageMapper";
import _ from "lodash";
import { D2MetadataPackage } from "../../types";
import { MetadataPackage, MetadataPackageSchema } from "../../../../domain/metadata/entities";

describe("mapPackage", () => {
    it("should no apply any transformation if not exist transformations", () => {
        const transformations: PackageTransformationStrategy<MetadataPackage, D2MetadataPackage>[] = [];
        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        expect(transformedPayload).toEqual(payload);
    });
    it("should no apply any transformation if there are no transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 34,
                transform: (payload: D2MetadataPackage) =>
                    renamePropInMetadataPackage(payload, "userRoles", "name", "34Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        expect(transformedPayload).toEqual(payload);
    });
    it("should apply transformation if there are one lower version transformation than the version argument", () => {
        const transformations = [
            {
                apiVersion: 30,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "name", "30Name")
            }
        ];
        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations);

        const userRoles = transformedPayload["userRoles"];
        expect(_.every(userRoles, de => de["30Name"])).toEqual(true);
    });
    it("should apply transformation if there are one version transformation equal to the version argument", () => {
        const transformations = [
            {
                apiVersion: 33,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const userRoles = transformedPayload["userRoles"];
        expect(_.every(userRoles, de => de["33Name"])).toEqual(true);
    });
    it("should apply all transformations if there are two transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 32,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "name", "32Name")
            },
            {
                apiVersion: 33,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "32Name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const userRoles = transformedPayload["userRoles"];
        expect(_.every(userRoles, de => de["33Name"])).toEqual(true);
    });
    it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 33,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "name", "32Name")
            },
            {
                apiVersion: 32,
                transform: (payload: D2MetadataPackage) => renamePropInMetadataPackage(payload, "userRoles", "32Name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const userRoles = transformedPayload["userRoles"];
        expect(_.every(userRoles, de => de["33Name"])).toEqual(true);
    });
});


export { };

function givenAMetadataPackage(): MetadataPackage {
    return {
        "userRoles": [
            {
                access: {
                    "read": true,
                    "update": true,
                    "externalize": true,
                    "delete": true,
                    "write": true,
                    "manage": true
                },
                attributeValues: [],
                authorities: [],
                code: "code",
                created: "2020-04-23T10:15:05.602",
                description: "User Role 1",
                displayName: "User Role 1",
                externalAccess: false,
                favorite: false,
                favorites: [],
                id: "1",
                lastUpdated: "2020-04-23T10:15:05.602",
                lastUpdatedBy: { id: "user1" },
                name: "User Role 1",
                publicAccess: "rw------",
                translations: [],
                user: { id: "user1" },
                userAccesses: [],
                userGroupAccesses: [],
                users: [],
            },
            {
                access: {
                    "read": true,
                    "update": true,
                    "externalize": true,
                    "delete": true,
                    "write": true,
                    "manage": true
                },
                attributeValues: [],
                authorities: [],
                code: "code",
                created: "2020-04-23T10:15:05.602",
                description: "User Role 2",
                displayName: "User Role 2",
                externalAccess: false,
                favorite: false,
                favorites: [],
                id: "2",
                lastUpdated: "2020-04-23T10:15:05.602",
                lastUpdatedBy: { id: "user2" },
                name: "User Role 2",
                publicAccess: "rw------",
                translations: [],
                user: { id: "user2" },
                userAccesses: [],
                userGroupAccesses: [],
                users: [],
            }
        ],
    }
}

function renamePropInMetadataPackage(
    payload: MetadataPackage,
    type: keyof MetadataPackageSchema,
    oldPropName: string,
    newPropName: string): D2MetadataPackage {

    const renameProp = (oldProp: string, newProp: string, { [oldProp]: old, ...others }) => {
        return { [newProp]: old, ...others };
    }

    if (payload[type]) {
        const renamedTypeItems = payload[type].map((typeItem: any) =>
            renameProp(oldPropName, newPropName, typeItem))

        const mappedPayLoad = {
            ...payload,
            [type]: renamedTypeItems,
        };

        return mappedPayLoad;
    } else {
        return payload;
    }
}
