import { PackageTransformationStrategy, mapPackageToD2Version } from "../D2VersionPackageMapper";
import _ from "lodash";
import { MetadataPackage } from "../../../../domain/synchronization/MetadataEntities";

describe("mapPackage", () => {
    it("should no apply any transformation if not exist transformations", () => {
        const transformations: PackageTransformationStrategy<MetadataPackage>[] = [];
        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        expect(transformedPayload).toEqual(payload);
    });
    it("should no apply any transformation if there are no transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 34,
                transform: (payload: MetadataPackage) =>
                    renamePropInMetadataPackage(payload, "dataElements", "name", "34Name")
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
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "name", "30Name")
            }
        ];
        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations);

        const dataElements = transformedPayload["dataElements"];
        expect(_.every(dataElements, de => de["30Name"])).toEqual(true);
    });
    it("should apply transformation if there are one version transformation equal to the version argument", () => {
        const transformations = [
            {
                apiVersion: 33,
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const dataElements = transformedPayload["dataElements"];
        expect(_.every(dataElements, de => de["33Name"])).toEqual(true);
    });
    it("should apply all transformations if there are two transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 32,
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "name", "32Name")
            },
            {
                apiVersion: 33,
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "32Name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const dataElements = transformedPayload["dataElements"];
        expect(_.every(dataElements, de => de["33Name"])).toEqual(true);
    });
    it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
        const transformations = [
            {
                apiVersion: 33,
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "name", "32Name")
            },
            {
                apiVersion: 32,
                transform: (payload: MetadataPackage) => renamePropInMetadataPackage(payload, "dataElements", "32Name", "33Name")
            }
        ];

        const payload = givenAMetadataPackage();

        const transformedPayload = mapPackageToD2Version(33, payload, transformations)

        const dataElements = transformedPayload["dataElements"];
        expect(_.every(dataElements, de => de["33Name"])).toEqual(true);
    });
});


export { };

function givenAMetadataPackage(): MetadataPackage {
    return {
        "dataElements": [
            {
                id: "1",
                name: "DE 1"
            },
            {
                id: "1",
                name: "DE 1"
            }
        ],
        "dataSets": [
            {
                id: "1",
                name: "DS 1"
            },
            {
                id: "1",
                name: "DS 1"
            }
        ]
    }
}

function renamePropInMetadataPackage(
    payload: MetadataPackage,
    type: string,
    oldPropName: string,
    newPropName: string) {

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
