// @ts-nocheck

import _ from "lodash";
import { MetadataEntities, MetadataPackage } from "../../../domain/metadata/entities/MetadataEntities";
import { Transformation } from "../../../domain/transformations/entities/Transformation";
import { TransformationD2ApiRepository } from "../TransformationD2ApiRepository";
import { D2MetadataPackage } from "../types";

const transformationRepository = new TransformationD2ApiRepository();

describe("Metadata transformations - D2Api", () => {
    describe("mapPackageTo", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<MetadataPackage, D2MetadataPackage>[] = [];
            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });

        it("should no apply any transformation if there are no transformations in the version range", () => {
            const transformations = [
                {
                    apiVersion: 34,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "name", "34Name"),
                },
            ];

            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });

        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "name", "31Name"),
                },
            ];
            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["31Name"])).toEqual(true);
        });

        it("should apply transformation if there is at least one version in the range", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "name", "31Name"),
                },
            ];
            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["31Name"])).toEqual(true);
        });

        it("should apply all transformations if there are two transformations in the range", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "name", "32Name"),
                },
                {
                    apiVersion: 33,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "32Name", "33Name"),
                },
            ];

            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["33Name"])).toEqual(true);
        });

        it("should apply all transformations in correct even if transformations are out of order", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "32Name", "33Name"),
                },
                {
                    apiVersion: 32,
                    apply: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "name", "32Name"),
                },
            ];

            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["33Name"])).toEqual(true);
        });
    });

    describe("mapPackageFrom", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<MetadataPackage, D2MetadataPackage>[] = [];
            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });

        it("should no apply any transformation if there are no transformations in the version range", () => {
            const transformations = [
                {
                    apiVersion: 34,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "34Name", "33Name"),
                },
            ];

            const payload = givenAMetadataPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });

        it("should apply transformation if there is at least one version in the range", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "32Name", "name"),
                },
            ];
            const payload = givenAMetadataPackage("32Name");

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["name"])).toEqual(true);
        });

        it("should apply transformation if there is one transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "33Name", "name"),
                },
            ];

            const payload = givenAMetadataPackage("33Name");

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["name"])).toEqual(true);
        });

        it("should apply all transformations if there are two transformations in the range", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "32Name", "31Name"),
                },
                {
                    apiVersion: 31,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "31Name", "name"),
                },
            ];

            const payload = givenAMetadataPackage("32Name");

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            const userRoles = transformedPayload["userRoles"];
            expect(_.every(userRoles, ur => ur["name"])).toEqual(true);
        });

        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "31Name", "name"),
                },
                {
                    apiVersion: 32,
                    undo: (payload: D2MetadataPackage) =>
                        renamePropInMetadataPackage(payload, "userRoles", "32Name", "31Name"),
                },
            ];

            const payload = givenAMetadataPackage("32Name");

            const transformedPayload = transformationRepository.mapPackageFrom(35, payload, transformations);

            const userRoles = transformedPayload["userRoles"];

            expect(_.every(userRoles, ur => ur["name"])).toEqual(true);
        });
    });
});

export {};

function givenAMetadataPackage(nameField = "name"): MetadataPackage {
    const metadataPackage = {
        userRoles: [
            {
                access: {
                    read: true,
                    update: true,
                    externalize: true,
                    delete: true,
                    write: true,
                    manage: true,
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
                    read: true,
                    update: true,
                    externalize: true,
                    delete: true,
                    write: true,
                    manage: true,
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
            },
        ],
    };

    if (nameField !== "name") {
        return renamePropInMetadataPackage(metadataPackage, "userRoles", "name", nameField);
    }

    return metadataPackage;
}

export function renameProp(item: any, oldPath: string, newPath: string) {
    const object = _.cloneDeep(item);

    const value = _.get(object, oldPath);
    _.unset(object, oldPath);
    _.set(object, newPath, value);

    return object;
}

export function renamePropInMetadataPackage(
    payload: MetadataPackage,
    type: keyof MetadataEntities,
    oldPropName: string,
    newPropName: string
): D2MetadataPackage {
    const itemsByType = payload[type];
    if (!itemsByType) return payload;

    const renamedTypeItems = itemsByType.map((item: unknown) => renameProp(item, oldPropName, newPropName));

    return { ...payload, [type]: renamedTypeItems };
}
