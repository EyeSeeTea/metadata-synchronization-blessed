// @ts-nocheck

import _ from "lodash";
import { AggregatedPackage } from "../../../domain/aggregated/entities/AggregatedPackage";
import { Transformation } from "../../../domain/transformations/entities/Transformation";
import { TransformationD2ApiRepository } from "../TransformationD2ApiRepository";
import { D2AggregatedPackage } from "../types";

const transformationRepository = new TransformationD2ApiRepository();

describe("Aggregated transformations - D2Api", () => {
    describe("mapPackageTo", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<AggregatedPackage, D2AggregatedPackage>[] = [];
            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(38, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should no apply any transformation if there are no transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 38,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "34Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(37, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 37,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "31Value"),
                },
            ];
            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["31Value"])).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 38,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["33Value"])).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 37,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "32Value"),
                },
                {
                    apiVersion: 38,
                    apply: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["33Value"])).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 38,
                    apply: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "33Value"),
                },
                {
                    apiVersion: 37,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "32Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["33Value"])).toEqual(true);
        });
    });
    describe("mapPackageFrom", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<AggregatedPackage, D2AggregatedPackage>[] = [];
            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should no apply any transformation if there are no transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 39,
                    transform: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "34Value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(37, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 37,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];
            const payload = givenAnAggregatedPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(39, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 38,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnAggregatedPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 38,
                    undo: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "31Value"),
                },
                {
                    apiVersion: 37,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnAggregatedPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 37,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
                {
                    apiVersion: 38,
                    undo: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "31Value"),
                },
            ];

            const payload = givenAnAggregatedPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(38, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
    });
});

export {};

function givenAnAggregatedPackage(valueField?: string): AggregatedPackage {
    const result = {
        dataValues: [
            {
                dataElement: "dataElementId",
                period: "2019",
                orgUnit: "orgUnitId",
                categoryOptionCombo: "categoryOption",
                value: "12",
                storedBy: "user",
                created: "2019-12-12",
                lastUpdated: "2019-12-12",
                followUp: false,
            },
        ],
    };

    if (valueField) {
        return renamePropInAggregatedPackage(result, "value", valueField);
    }

    return result;
}

function renamePropInAggregatedPackage(
    payload: AggregatedPackage,
    oldPropName: string,
    newPropName: string
): D2AggregatedPackage {
    const dataValues = payload.dataValues.map(original => {
        return {
            ..._.omit(original, [oldPropName]),
            [newPropName]: _.get(original, [oldPropName]),
        };
    });

    return { dataValues };
}
