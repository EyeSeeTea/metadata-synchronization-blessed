import { ExpressionParser } from "../expressionParser";

describe("Expression parser", () => {
    it("data element - should find all properties", () => {
        const validation = ExpressionParser.parse("#{P3jJH5Tu5VC.S34ULMcHMca.Z3jxH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: "Z3jxH5Tu5VC",
            },
        ]);
    });

    it("data element - should find all mandatory properties", () => {
        const validation = ExpressionParser.parse("#{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("data element - should give error", () => {
        const validation = ExpressionParser.parse("#{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("data element - should give error", () => {
        const validation = ExpressionParser.parse("#{invalidId}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program data element - should find all properties", () => {
        const validation = ExpressionParser.parse("D{P3jJH5Tu5VC.S34ULMcHMca}");
        expect(validation.value.data).toEqual([
            {
                type: "programDataElement",
                program: "P3jJH5Tu5VC",
                dataElement: "S34ULMcHMca",
            },
        ]);
    });

    it("program data element - should give error", () => {
        const validation = ExpressionParser.parse("D{P3jJH5Tu5VC}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program attribute - should find all properties", () => {
        const validation = ExpressionParser.parse("A{P3jJH5Tu5VC.S34ULMcHMca}");
        expect(validation.value.data).toEqual([
            {
                type: "programAttribute",
                program: "P3jJH5Tu5VC",
                attribute: "S34ULMcHMca",
            },
        ]);
    });

    it("program attribute - should give error", () => {
        const validation = ExpressionParser.parse("A{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program attribute - should find all properties", () => {
        const validation = ExpressionParser.parse("I{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "programIndicator",
                programIndicator: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("program attribute - should give error", () => {
        const validation = ExpressionParser.parse("I{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("reporting rate - should find all properties", () => {
        const validation = ExpressionParser.parse("R{P3jJH5Tu5VC.REPORTING_RATE}");
        expect(validation.value.data).toEqual([
            {
                type: "reportingRate",
                dataSet: "P3jJH5Tu5VC",
                metric: "REPORTING_RATE",
            },
        ]);
    });

    it("reporting rate - should give error with invalid metric", () => {
        const validation = ExpressionParser.parse("R{P3jJH5Tu5VC.INVALID}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("reporting rate - should give error", () => {
        const validation = ExpressionParser.parse("R{P3jJH5Tu5VC}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("constant - should find all properties", () => {
        const validation = ExpressionParser.parse("C{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "constant",
                constant: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("constant - should give error", () => {
        const validation = ExpressionParser.parse("C{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("indicator - should find all properties", () => {
        const validation = ExpressionParser.parse("N{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "indicator",
                indicator: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("indicator - should give error", () => {
        const validation = ExpressionParser.parse("N{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("organisationUnitGroup - should find all properties", () => {
        const validation = ExpressionParser.parse("OUG{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "organisationUnitGroup",
                organisationUnitGroup: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("organisationUnitGroup - should give error", () => {
        const validation = ExpressionParser.parse("OUG{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("number - parse correctly integer", () => {
        const validation = ExpressionParser.parse("2");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 2,
            },
        ]);
    });

    it("number - parse correctly float", () => {
        const validation = ExpressionParser.parse("2.34");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 2.34,
            },
        ]);
    });

    it("number - parse correctly float without first number", () => {
        const validation = ExpressionParser.parse(".34");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 0.34,
            },
        ]);
    });

    it("text - should give error", () => {
        const validation = ExpressionParser.parse("test");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("empty - should give error", () => {
        const validation = ExpressionParser.parse("");
        expect(validation.value.error).toEqual("EMPTY_EXPRESION");
    });

    it("operation - example 1", () => {
        const validation = ExpressionParser.parse(
            "#{P3jJH5Tu5VC.S34ULMcHMca} + C{Gfd3ppDfq8E} + OUG{CXw2yu5fodb}"
        );
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            { type: "constant", constant: "Gfd3ppDfq8E" },
            { type: "operator", operator: "+" },
            {
                type: "organisationUnitGroup",
                organisationUnitGroup: "CXw2yu5fodb",
            },
        ]);
    });

    it("operation - example 2", () => {
        const validation = ExpressionParser.parse("#{P3jJH5Tu5VC} + 2");
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: undefined,
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            { type: "number", value: 2 },
        ]);
    });

    it("operation - example 3", () => {
        const validation = ExpressionParser.parse(
            "#{P3jJH5Tu5VC.S34ULMcHMca} + #{P3jJH5Tu5VC.*.j8vBiBqGf6O} + #{P3jJH5Tu5VC.S34ULMcHMca.*}"
        );
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "*",
                attributeOptionCombo: "j8vBiBqGf6O",
            },
            { type: "operator", operator: "+" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: "*",
            },
        ]);
    });

    it("operation - example 4", () => {
        const validation = ExpressionParser.parse(
            "( D{eBAyeGv0exc.vV9UWAZohSf} * A{IpHINAT79UW.cejWyOfXge6} ) / D{eBAyeGv0exc.GieVkTxp4HH}"
        );
        expect(validation.value.data).toEqual([
            { type: "parentheses", operator: "(" },
            {
                type: "programDataElement",
                program: "eBAyeGv0exc",
                dataElement: "vV9UWAZohSf",
            },
            { type: "operator", operator: "*" },
            {
                type: "programAttribute",
                program: "IpHINAT79UW",
                attribute: "cejWyOfXge6",
            },
            { type: "parentheses", operator: ")" },
            { type: "operator", operator: "/" },
            {
                type: "programDataElement",
                program: "eBAyeGv0exc",
                dataElement: "GieVkTxp4HH",
            },
        ]);
    });

    it("operation - example 5", () => {
        const validation = ExpressionParser.parse("I{EMOt6Fwhs1n} * 1000 / #{WUg3MYWQ7pt}");
        expect(validation.value.data).toEqual([
            { type: "programIndicator", programIndicator: "EMOt6Fwhs1n" },
            { type: "operator", operator: "*" },
            { type: "number", value: 1000 },
            { type: "operator", operator: "/" },
            {
                type: "dataElement",
                dataElement: "WUg3MYWQ7pt",
                categoryOptionCombo: undefined,
                attributeOptionCombo: undefined,
            },
        ]);
    });

    it("operation - example 6", () => {
        const validation = ExpressionParser.parse(
            "R{BfMAe6Itzgt.REPORTING_RATE} * #{P3jJH5Tu5VC.S34ULMcHMca}"
        );
        expect(validation.value.data).toEqual([
            {
                type: "reportingRate",
                dataSet: "BfMAe6Itzgt",
                metric: "REPORTING_RATE",
            },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
        ]);
    });

    it("operation - example 7", () => {
        const validation = ExpressionParser.parse(
            "R{BfMAe6Itzgt.ACTUAL_REPORTS} / R{BfMAe6Itzgt.EXPECTED_REPORTS}"
        );
        expect(validation.value.data).toEqual([
            {
                type: "reportingRate",
                dataSet: "BfMAe6Itzgt",
                metric: "ACTUAL_REPORTS",
            },
            { type: "operator", operator: "/" },
            {
                type: "reportingRate",
                dataSet: "BfMAe6Itzgt",
                metric: "EXPECTED_REPORTS",
            },
        ]);
    });

    it("operation - example 8", () => {
        const validation = ExpressionParser.parse("N{Rigf2d2Zbjp} * #{P3jJH5Tu5VC.S34ULMcHMca}");
        expect(validation.value.data).toEqual([
            { type: "indicator", indicator: "Rigf2d2Zbjp" },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
        ]);
    });

    it("operation - example 9", () => {
        const validation = ExpressionParser.parse(
            "( 2 * #{P3jJH5Tu5VC.S34ULMcHMca} ) / ( #{FQ2o8UBlcrS.S34ULMcHMca} - 200 ) * 25"
        );
        expect(validation.value.data).toEqual([
            { type: "parentheses", operator: "(" },
            { type: "number", value: 2 },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "parentheses", operator: ")" },
            { type: "operator", operator: "/" },
            { type: "parentheses", operator: "(" },
            {
                type: "dataElement",
                dataElement: "FQ2o8UBlcrS",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "-" },
            { type: "number", value: 200 },
            { type: "parentheses", operator: ")" },
            { type: "operator", operator: "*" },
            { type: "number", value: 25 },
        ]);
    });

    it("operation - example 10", () => {
        const validation = ExpressionParser.parse(
            "#{A03MvHHogjR.a3kGcGDCuk6} + A{OvY4VVhSDeJ} + V{incident_date} + C{bCqvfPR02Im}"
        );
        expect(validation.value.data).toEqual([
            {
                type: 'dataElement',
                dataElement: 'A03MvHHogjR',
                categoryOptionCombo: 'a3kGcGDCuk6',
                attributeOptionCombo: undefined
            },
            { type: 'operator', operator: '+' },
            {
                type: 'programAttribute',
                program: undefined,
                attribute: 'OvY4VVhSDeJ'
            },
            { type: 'operator', operator: '+' },
            { type: 'programVariable', variable: 'incident_date' },
            { type: 'operator', operator: '+' },
            { type: 'constant', constant: 'bCqvfPR02Im' }
        ]);
    });
});

export {};
