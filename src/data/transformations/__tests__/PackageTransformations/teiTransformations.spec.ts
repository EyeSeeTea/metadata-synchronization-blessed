import { teiTransformations } from "../../PackageTransformations";

describe("TEI Transformations", () => {
    describe("tei enrollment attributes must go at tei level only for >= 2.41", () => {
        const transformation = teiTransformations[0];

        it("should have expected structure", () => {
            expect(transformation.name).toBe("tei enrollment attributes must go at tei level only for >= 2.41");
            expect(transformation.apiVersion).toBe(41);
            expect(transformation.apply).toBeDefined();
            expect(transformation.undo).not.toBeDefined();
        });

        describe("apply", () => {
            it("should remove attributes from enrollments when trackedEntities exist", () => {
                const inputPackage = {
                    trackedEntities: [
                        {
                            id: "tei1",
                            attributes: [
                                { attribute: "attr1", value: "value1" },
                                { attribute: "attr2", value: "value2" },
                            ],
                            enrollments: [
                                {
                                    id: "enrollment1",
                                    program: "program1",
                                    attributes: [
                                        { attribute: "attr1", value: "value1" },
                                        { attribute: "attr2", value: "value2" },
                                    ],
                                },
                                {
                                    id: "enrollment2",
                                    program: "program2",
                                    attributes: [{ attribute: "attr3", value: "value3" }],
                                },
                            ],
                        },
                        {
                            id: "tei2",
                            attributes: [{ attribute: "attr4", value: "value4" }],
                            enrollments: [
                                {
                                    id: "enrollment3",
                                    program: "program3",
                                    attributes: [{ attribute: "attr4", value: "value4" }],
                                },
                            ],
                        },
                    ],
                    otherProperty: "should be preserved",
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.otherProperty).toBe("should be preserved");

                // Should preserve TEI attributes
                expect(result.trackedEntities[0].attributes).toEqual([
                    { attribute: "attr1", value: "value1" },
                    { attribute: "attr2", value: "value2" },
                ]);
                expect(result.trackedEntities[1].attributes).toEqual([{ attribute: "attr4", value: "value4" }]);

                // Should remove attributes from all enrollments
                expect(result.trackedEntities[0].enrollments[0].attributes).toEqual([]);
                expect(result.trackedEntities[0].enrollments[1].attributes).toEqual([]);
                expect(result.trackedEntities[1].enrollments[0].attributes).toEqual([]);

                expect(result.trackedEntities[0].enrollments[0].id).toBe("enrollment1");
                expect(result.trackedEntities[0].enrollments[0].program).toBe("program1");
                expect(result.trackedEntities[0].enrollments[1].id).toBe("enrollment2");
                expect(result.trackedEntities[0].enrollments[1].program).toBe("program2");
                expect(result.trackedEntities[1].enrollments[0].id).toBe("enrollment3");
                expect(result.trackedEntities[1].enrollments[0].program).toBe("program3");
            });

            it("should handle TEI with no enrollments", () => {
                const inputPackage = {
                    trackedEntities: [
                        {
                            id: "tei1",
                            attributes: [{ attribute: "attr1", value: "value1" }],
                        },
                    ],
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.trackedEntities[0].id).toBe("tei1");
                expect(result.trackedEntities[0].attributes).toEqual([{ attribute: "attr1", value: "value1" }]);
                expect(result.trackedEntities[0].enrollments).toBeUndefined();
            });

            it("should handle TEI with undefined enrollments", () => {
                const inputPackage = {
                    trackedEntities: [
                        {
                            id: "tei1",
                            attributes: [{ attribute: "attr1", value: "value1" }],
                            enrollments: undefined,
                        },
                    ],
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.trackedEntities[0].id).toBe("tei1");
                expect(result.trackedEntities[0].attributes).toEqual([{ attribute: "attr1", value: "value1" }]);
                expect(result.trackedEntities[0].enrollments).toBeUndefined();
            });

            it("should handle TEI with empty enrollments array", () => {
                const inputPackage = {
                    trackedEntities: [
                        {
                            id: "tei1",
                            attributes: [{ attribute: "attr1", value: "value1" }],
                            enrollments: [],
                        },
                    ],
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.trackedEntities[0].id).toBe("tei1");
                expect(result.trackedEntities[0].attributes).toEqual([{ attribute: "attr1", value: "value1" }]);
                expect(result.trackedEntities[0].enrollments).toEqual([]);
            });

            it("should handle enrollments without attributes property", () => {
                const inputPackage = {
                    trackedEntities: [
                        {
                            id: "tei1",
                            attributes: [{ attribute: "attr1", value: "value1" }],
                            enrollments: [
                                {
                                    id: "enrollment1",
                                    program: "program1",
                                    // no attributes property
                                },
                            ],
                        },
                    ],
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.trackedEntities[0].enrollments[0].attributes).toEqual([]);
                expect(result.trackedEntities[0].enrollments[0].id).toBe("enrollment1");
                expect(result.trackedEntities[0].enrollments[0].program).toBe("program1");
            });

            it("should handle package without trackedEntities property", () => {
                const inputPackage = {
                    otherProperty: "should be preserved",
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.otherProperty).toBe("should be preserved");
                expect(result.trackedEntities).toBeUndefined();
            });

            it("should handle empty trackedEntities array", () => {
                const inputPackage = {
                    trackedEntities: [],
                    otherProperty: "should be preserved",
                };

                const result = transformation.apply && (transformation.apply(inputPackage) as any);

                expect(result.otherProperty).toBe("should be preserved");
                expect(result.trackedEntities).toEqual([]);
            });
        });
    });
});
