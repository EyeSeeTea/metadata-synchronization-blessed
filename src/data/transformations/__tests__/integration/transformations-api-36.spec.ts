import _ from "lodash";
import { sync } from "./helpers";

describe("API 36", () => {
    beforeAll(() => {
        jest.setTimeout(30000);
    });

    describe("Transformation 2.34 -> 2.36", () => {
        it("Remove duplicate transformations", async () => {
            const metadata = {
                dataElements: [
                    {
                        code: "BU_EPI_Gender",
                        lastUpdated: "2020-10-30T16:12:08.461",
                        id: "zqv3IsyTYta",
                        created: "2018-05-09T22:26:29.218",
                        name: "BU_EPI_Gender",
                        shortName: "# BU cases (by gender)",
                        aggregationType: "SUM",
                        domainType: "AGGREGATE",
                        displayName: "BU_EPI_Gender",
                        translations: [
                            {
                                property: "SHORT_NAME",
                                locale: "fr",
                                value: "# cas d'UB par sexe",
                            },
                            {
                                property: "NAME",
                                locale: "fr",
                                value: "Nombre de cas d'ulc�re de Buruli (par genre)",
                            },
                            {
                                property: "SHORT_NAME",
                                locale: "fr",
                                value: "Cas d'ulc�re de Buruli (par genre)",
                            },
                            {
                                property: "FORM_NAME",
                                locale: "fr",
                                value: "Nombre de nouveaux cas d'UB par sexe",
                            },
                        ],
                    },
                ],
            };

            const { dataElements } = await sync({
                from: "2.34",
                to: "2.36",
                metadata,
                models: ["dataElements"],
            });

            const translations = dataElements["zqv3IsyTYta"].translations as any[];

            const translationsOldDuplicate = translations.filter(
                trans => trans.property === "SHORT_NAME" && trans.locale === "fr"
            );

            expect(translationsOldDuplicate.length).toBe(1);
        });
    });
});

export {};
