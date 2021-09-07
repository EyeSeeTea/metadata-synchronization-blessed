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

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should no apply any transformation if there are no transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 34,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "34Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "31Value"),
                },
            ];
            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["31Value"])).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["33Value"])).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "32Value"),
                },
                {
                    apiVersion: 33,
                    apply: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["33Value"])).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    apply: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "33Value"),
                },
                {
                    apiVersion: 32,
                    apply: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "value", "32Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

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
                    apiVersion: 34,
                    transform: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "34Value", "33Value"),
                },
            ];

            const payload = givenAnAggregatedPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];
            const payload = givenAnAggregatedPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnAggregatedPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(31, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    undo: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "31Value"),
                },
                {
                    apiVersion: 31,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnAggregatedPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(32, payload, transformations);

            expect(_.every(transformedPayload.dataValues, dataValue => dataValue["value"])).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2AggregatedPackage) => renamePropInAggregatedPackage(payload, "31Value", "value"),
                },
                {
                    apiVersion: 32,
                    undo: (payload: D2AggregatedPackage) =>
                        renamePropInAggregatedPackage(payload, "32Value", "31Value"),
                },
            ];

            const payload = givenAnAggregatedPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(32, payload, transformations);

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
