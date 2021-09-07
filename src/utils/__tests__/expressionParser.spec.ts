import { ExpressionParser } from "../expressionParser";

describe("Expression parser", () => {
    it("data element - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "#{P3jJH5Tu5VC.S34ULMcHMca.Z3jxH5Tu5VC}");
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
        const validation = ExpressionParser.parse("indicator", "#{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("data element - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "#{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("data element - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "#{invalidId}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program data element - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "D{P3jJH5Tu5VC.S34ULMcHMca}");
        expect(validation.value.data).toEqual([
            {
                type: "programDataElement",
                program: "P3jJH5Tu5VC",
                dataElement: "S34ULMcHMca",
            },
        ]);
    });

    it("program data element - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "D{P3jJH5Tu5VC}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program attribute - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "A{P3jJH5Tu5VC.S34ULMcHMca}");
        expect(validation.value.data).toEqual([
            {
                type: "programAttribute",
                program: "P3jJH5Tu5VC",
                attribute: "S34ULMcHMca",
            },
        ]);
    });

    it("program attribute - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "A{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("program indicator - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "I{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "programIndicator",
                programIndicator: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("program indicator - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "I{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("reporting rate - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "R{P3jJH5Tu5VC.REPORTING_RATE}");
        expect(validation.value.data).toEqual([
            {
                type: "reportingRate",
                dataSet: "P3jJH5Tu5VC",
                metric: "REPORTING_RATE",
            },
        ]);
    });

    it("reporting rate - should give error with invalid metric", () => {
        const validation = ExpressionParser.parse("indicator", "R{P3jJH5Tu5VC.INVALID}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("reporting rate - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "R{P3jJH5Tu5VC}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("constant - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "C{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "constant",
                constant: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("constant - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "C{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("indicator - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "N{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "indicator",
                indicator: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("indicator - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "N{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("organisationUnitGroup - should find all properties", () => {
        const validation = ExpressionParser.parse("indicator", "OUG{P3jJH5Tu5VC}");
        expect(validation.value.data).toEqual([
            {
                type: "organisationUnitGroup",
                organisationUnitGroup: "P3jJH5Tu5VC",
            },
        ]);
    });

    it("organisationUnitGroup - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "OUG{}");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("number - parse correctly integer", () => {
        const validation = ExpressionParser.parse("indicator", "2");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 2,
            },
        ]);
    });

    it("number - parse correctly float", () => {
        const validation = ExpressionParser.parse("indicator", "2.34");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 2.34,
            },
        ]);
    });

    it("number - parse correctly float without first number", () => {
        const validation = ExpressionParser.parse("indicator", ".34");
        expect(validation.value.data).toEqual([
            {
                type: "number",
                value: 0.34,
            },
        ]);
    });

    it("text - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "test");
        expect(validation.value.error).toEqual("MALFORMED_EXPRESSION");
    });

    it("empty - should give error", () => {
        const validation = ExpressionParser.parse("indicator", "");
        expect(validation.value.error).toEqual("EMPTY_EXPRESION");
    });

    it("parse - example 1", () => {
        const validation = ExpressionParser.parse(
            "indicator",
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

    it("parse - example 2", () => {
        const validation = ExpressionParser.parse("indicator", "#{P3jJH5Tu5VC} + 2");
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

    it("parse - example 3", () => {
        const validation = ExpressionParser.parse(
            "indicator",
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

    it("parse - example 4", () => {
        const validation = ExpressionParser.parse(
            "indicator",
            "( D{eBAyeGv0exc.vV9UWAZohSf} * A{IpHINAT79UW.cejWyOfXge6} ) / D{eBAyeGv0exc.GieVkTxp4HH}"
        );
        expect(validation.value.data).toEqual([
            { type: "parentheses", parentheses: "(" },
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
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "/" },
            {
                type: "programDataElement",
                program: "eBAyeGv0exc",
                dataElement: "GieVkTxp4HH",
            },
        ]);
    });

    it("parse - example 5", () => {
        const validation = ExpressionParser.parse("indicator", "I{EMOt6Fwhs1n} * 1000 / #{WUg3MYWQ7pt}");
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

    it("parse - example 6", () => {
        const validation = ExpressionParser.parse(
            "indicator",
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

    it("parse - example 7", () => {
        const validation = ExpressionParser.parse(
            "indicator",
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

    it("parse - example 8", () => {
        const validation = ExpressionParser.parse("indicator", "N{Rigf2d2Zbjp} * #{P3jJH5Tu5VC.S34ULMcHMca}");
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

    it("parse - example 9", () => {
        const validation = ExpressionParser.parse(
            "indicator",
            "( 2 * #{P3jJH5Tu5VC.S34ULMcHMca} ) / ( #{FQ2o8UBlcrS.S34ULMcHMca} - 200 ) * 25"
        );
        expect(validation.value.data).toEqual([
            { type: "parentheses", parentheses: "(" },
            { type: "number", value: 2 },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "/" },
            { type: "parentheses", parentheses: "(" },
            {
                type: "dataElement",
                dataElement: "FQ2o8UBlcrS",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "-" },
            { type: "number", value: 200 },
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "*" },
            { type: "number", value: 25 },
        ]);
    });

    it("parse - example 10", () => {
        const validation = ExpressionParser.parse(
            "indicator",
            "#{A03MvHHogjR.a3kGcGDCuk6} + A{OvY4VVhSDeJ} + V{incident_date} + C{bCqvfPR02Im}"
        );
        expect(validation.value.data).toEqual([
            {
                type: "dataElement",
                dataElement: "A03MvHHogjR",
                categoryOptionCombo: "a3kGcGDCuk6",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            {
                type: "programAttribute",
                program: undefined,
                attribute: "OvY4VVhSDeJ",
            },
            { type: "operator", operator: "+" },
            { type: "programVariable", variable: "incident_date" },
            { type: "operator", operator: "+" },
            { type: "constant", constant: "bCqvfPR02Im" },
        ]);
    });

    it("parse - example 11", () => {
        const validation = ExpressionParser.parse(
            "programIndicator",
            "#{A03MvHHogjR.a3kGcGDCuk6} + A{OvY4VVhSDeJ} + V{incident_date} + C{bCqvfPR02Im}"
        );

        expect(validation.value.data).toEqual([
            {
                type: "programIndicatorDataElement",
                dataElement: "a3kGcGDCuk6",
                programStage: "A03MvHHogjR",
            },
            { type: "operator", operator: "+" },
            {
                type: "programAttribute",
                program: undefined,
                attribute: "OvY4VVhSDeJ",
            },
            { type: "operator", operator: "+" },
            { type: "programVariable", variable: "incident_date" },
            { type: "operator", operator: "+" },
            { type: "constant", constant: "bCqvfPR02Im" },
        ]);
    });

    it("parse - example 12", () => {
        const validation = ExpressionParser.parse("programIndicator", "C{qRquxuP5Zow} == 12");

        expect(validation.value.data).toEqual([
            { type: "constant", constant: "qRquxuP5Zow" },
            { type: "logical", logical: "==" },
            { type: "number", value: 12 },
        ]);
    });

    it("build - example 1", () => {
        const validation = ExpressionParser.build("indicator", [
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

        expect(validation.value.data).toEqual("#{P3jJH5Tu5VC.S34ULMcHMca} + C{Gfd3ppDfq8E} + OUG{CXw2yu5fodb}");
    });

    it("build - example 2", () => {
        const validation = ExpressionParser.build("indicator", [
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: undefined,
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            { type: "number", value: 2 },
        ]);

        expect(validation.value.data).toEqual("#{P3jJH5Tu5VC} + 2");
    });

    it("build - example 3", () => {
        const validation = ExpressionParser.build("indicator", [
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

        expect(validation.value.data).toEqual(
            "#{P3jJH5Tu5VC.S34ULMcHMca} + #{P3jJH5Tu5VC.*.j8vBiBqGf6O} + #{P3jJH5Tu5VC.S34ULMcHMca.*}"
        );
    });

    it("build - example 4", () => {
        const validation = ExpressionParser.build("indicator", [
            { type: "parentheses", parentheses: "(" },
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
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "/" },
            {
                type: "programDataElement",
                program: "eBAyeGv0exc",
                dataElement: "GieVkTxp4HH",
            },
        ]);

        expect(validation.value.data).toEqual(
            "( D{eBAyeGv0exc.vV9UWAZohSf} * A{IpHINAT79UW.cejWyOfXge6} ) / D{eBAyeGv0exc.GieVkTxp4HH}"
        );
    });

    it("build - example 5", () => {
        const validation = ExpressionParser.build("indicator", [
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

        expect(validation.value.data).toEqual("I{EMOt6Fwhs1n} * 1000 / #{WUg3MYWQ7pt}");
    });

    it("build - example 6", () => {
        const validation = ExpressionParser.build("indicator", [
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

        expect(validation.value.data).toEqual("R{BfMAe6Itzgt.REPORTING_RATE} * #{P3jJH5Tu5VC.S34ULMcHMca}");
    });

    it("build - example 7", () => {
        const validation = ExpressionParser.build("indicator", [
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

        expect(validation.value.data).toEqual("R{BfMAe6Itzgt.ACTUAL_REPORTS} / R{BfMAe6Itzgt.EXPECTED_REPORTS}");
    });

    it("build - example 8", () => {
        const validation = ExpressionParser.build("indicator", [
            { type: "indicator", indicator: "Rigf2d2Zbjp" },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
        ]);

        expect(validation.value.data).toEqual("N{Rigf2d2Zbjp} * #{P3jJH5Tu5VC.S34ULMcHMca}");
    });

    it("build - example 9", () => {
        const validation = ExpressionParser.build("indicator", [
            { type: "parentheses", parentheses: "(" },
            { type: "number", value: 2 },
            { type: "operator", operator: "*" },
            {
                type: "dataElement",
                dataElement: "P3jJH5Tu5VC",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "/" },
            { type: "parentheses", parentheses: "(" },
            {
                type: "dataElement",
                dataElement: "FQ2o8UBlcrS",
                categoryOptionCombo: "S34ULMcHMca",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "-" },
            { type: "number", value: 200 },
            { type: "parentheses", parentheses: ")" },
            { type: "operator", operator: "*" },
            { type: "number", value: 25 },
        ]);

        expect(validation.value.data).toEqual(
            "( 2 * #{P3jJH5Tu5VC.S34ULMcHMca} ) / ( #{FQ2o8UBlcrS.S34ULMcHMca} - 200 ) * 25"
        );
    });

    it("build - example 10", () => {
        const validation = ExpressionParser.build("indicator", [
            {
                type: "dataElement",
                dataElement: "A03MvHHogjR",
                categoryOptionCombo: "a3kGcGDCuk6",
                attributeOptionCombo: undefined,
            },
            { type: "operator", operator: "+" },
            {
                type: "programAttribute",
                program: undefined,
                attribute: "OvY4VVhSDeJ",
            },
            { type: "operator", operator: "+" },
            { type: "programVariable", variable: "incident_date" },
            { type: "operator", operator: "+" },
            { type: "constant", constant: "bCqvfPR02Im" },
        ]);

        expect(validation.value.data).toEqual(
            "#{A03MvHHogjR.a3kGcGDCuk6} + A{OvY4VVhSDeJ} + V{incident_date} + C{bCqvfPR02Im}"
        );
    });

    it("build - example 11", () => {
        const validation = ExpressionParser.build("programIndicator", [
            {
                type: "programIndicatorDataElement",
                dataElement: "a3kGcGDCuk6",
                programStage: "A03MvHHogjR",
            },
            { type: "operator", operator: "+" },
            {
                type: "programAttribute",
                program: undefined,
                attribute: "OvY4VVhSDeJ",
            },
            { type: "operator", operator: "+" },
            { type: "programVariable", variable: "incident_date" },
            { type: "operator", operator: "+" },
            { type: "constant", constant: "bCqvfPR02Im" },
        ]);

        expect(validation.value.data).toEqual(
            "#{A03MvHHogjR.a3kGcGDCuk6} + A{OvY4VVhSDeJ} + V{incident_date} + C{bCqvfPR02Im}"
        );
    });

    it("build - example 12", () => {
        const validation = ExpressionParser.build("programIndicator", [
            { type: "constant", constant: "qRquxuP5Zow" },
            { type: "logical", logical: "==" },
            { type: "number", value: 12 },
        ]);

        expect(validation.value.data).toEqual("C{qRquxuP5Zow} == 12");
    });
});

export {};
