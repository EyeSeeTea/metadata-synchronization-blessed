// @ts-nocheck

import _ from "lodash";
import { EventsPackage } from "../../../domain/events/entities/EventsPackage";
import { Transformation } from "../../../domain/transformations/entities/Transformation";
import { TransformationD2ApiRepository } from "../TransformationD2ApiRepository";
import { D2EventsPackage } from "../types";

const transformationRepository = new TransformationD2ApiRepository();

describe("Events transformations - D2Api", () => {
    describe("mapPackageTo", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<EventsPackage, D2EventsPackage>[] = [];
            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should no apply any transformation if there are no transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 34,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "value", "34Value"),
                },
            ];

            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "value", "31Value"),
                },
            ];
            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["31Value"]
                )
            ).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "value", "33Value"),
                },
            ];

            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["33Value"]
                )
            ).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "value", "32Value"),
                },
                {
                    apiVersion: 33,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "32Value", "33Value"),
                },
            ];

            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["33Value"]
                )
            ).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 33,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "32Value", "33Value"),
                },
                {
                    apiVersion: 32,
                    apply: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "value", "32Value"),
                },
            ];

            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageTo(33, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["33Value"]
                )
            ).toEqual(true);
        });
    });
    describe("mapPackageFrom", () => {
        it("should no apply any transformation if not exist transformations", () => {
            const transformations: Transformation<EventsPackage, D2EventsPackage>[] = [];
            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should no apply any transformation if there are no transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 34,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "34Value", "33Value"),
                },
            ];

            const payload = givenAnEventsPackage();

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(transformedPayload).toEqual(payload);
        });
        it("should apply transformation if there are one lower version transformation than the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "31Value", "value"),
                },
            ];
            const payload = givenAnEventsPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(33, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["value"]
                )
            ).toEqual(true);
        });
        it("should apply transformation if there are one version transformation equal to the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnEventsPackage("31Value");

            const transformedPayload = transformationRepository.mapPackageFrom(31, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["value"]
                )
            ).toEqual(true);
        });
        it("should apply all transformations if there are two transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 32,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "32Value", "31Value"),
                },
                {
                    apiVersion: 31,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "31Value", "value"),
                },
            ];

            const payload = givenAnEventsPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(32, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["value"]
                )
            ).toEqual(true);
        });
        it("should apply all transformations in correct even if there are disordered transformations for the version argument", () => {
            const transformations = [
                {
                    apiVersion: 31,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "31Value", "value"),
                },
                {
                    apiVersion: 32,
                    undo: (payload: D2EventsPackage) => renamePropInEventsPackage(payload, "32Value", "31Value"),
                },
            ];

            const payload = givenAnEventsPackage("32Value");

            const transformedPayload = transformationRepository.mapPackageFrom(32, payload, transformations);

            expect(
                _.every(
                    _.flatten(transformedPayload.events.map(({ dataValues }) => dataValues)),
                    dataValue => dataValue["value"]
                )
            ).toEqual(true);
        });
    });
});

export {};

function givenAnEventsPackage(valueField?: string): EventsPackage {
    const result: EventsPackage = {
        events: [
            {
                eventDate: "NA",
                orgUnit: "NA",
                id: "NA",
                program: "NA",
                href: "NA",
                programStage: "NA",
                created: "NA",
                deleted: false,
                lastUpdated: "NA",
                status: "NA",
                storedBy: "NA",
                dueDate: "NA",
                dataValues: [
                    {
                        dataElement: "dataElementId",
                        storedBy: "user",
                        created: "2019-12-12",
                        lastUpdated: "2019-12-12",
                        value: "12",
                        providedElsewhere: false,
                    },
                ],
            },
        ],
    };

    if (valueField) {
        return renamePropInEventsPackage(result, "value", valueField);
    }

    return result;
}

function renamePropInEventsPackage(payload: EventsPackage, oldPropName: string, newPropName: string): D2EventsPackage {
    const events = payload.events.map(({ dataValues, ...rest }) => {
        return {
            ...rest,
            dataValues: dataValues.map(original => ({
                ..._.omit(original, [oldPropName]),
                [newPropName]: _.get(original, [oldPropName]),
            })),
        };
    });

    return { events };
}
