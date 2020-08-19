import { Either } from "../domain/common/entities/Either";

export class ExpressionParser {
    // Detects operators in a expression (meant to be used with String.split)
    private static operators = /\s*?([+\-/\*]|\[days\])*\s?/;

    // Looks up for all valid ids in a string (meant to be used with String.match)
    private static isValidUid = /[a-zA-Z]{1}[a-zA-Z0-9]{10}/g;

    // Extracts ids in named groups (meant to be used with String.match()?.groups)
    private static dataElementExp = /^#\{(?<dataElement>[a-zA-Z]{1}[a-zA-Z0-9]{10}).?(?<categoryOptionCombo>[a-zA-Z]{1}[a-zA-Z0-9]{10})?.?(?<attributeOptionCombo>[a-zA-Z]{1}[a-zA-Z0-9]{10})?\}$/;
    private static programDataElementExp = /^D\{(?<program>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<dataElement>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programAttributeExp = /^A\{(?<program>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<attribute>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programIndicatorExp = /^I\{(?<programIndicator>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static reportingRateExp = /^R\{(?<dataSet>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<metric>REPORTING_RATE|REPORTING_RATE_ON_TIME|ACTUAL_REPORTS|ACTUAL_REPORTS_ON_TIME|EXPECTED_REPORTS)\}$/;
    private static constantExp = /^C\{(?<constant>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static indicatorExp = /^N\{(?<indicator>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static orgUnitGroupExp = /^OUG\{(?<organisationUnitGroup>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;

    public static parse(formula: string): Either<ParserError, Expression[]> {
        const results = formula
            .split(this.operators)
            .map(expression => this.detectExpression(expression));

        const error = this.validate(results);
        if (error) return Either.error(error);

        return Either.success(results as Expression[]);
    }

    public static build(expressions: Expression[]): Either<ParserError, string> {
        const error = this.validate(expressions);
        if (error) return Either.error(error);

        // TODO

        return Either.success("");
    }

    public static extractIds(formula: string): string[] {
        return formula.match(this.isValidUid) ?? [];
    }

    private static validate(expressions: Array<Expression | null>): ParserError | undefined {
        for (const [index, expression] of expressions.entries()) {
            if (expression === null) {
                return "MALFORMED_EXPRESSION";
            } else if (this.isOperatorPosition(index) && expression.type !== "operator") {
                return "MALFORMED_EXPRESSION";
            } else if (!this.isOperatorPosition(index) && expression.type === "operator") {
                return "MALFORMED_EXPRESSION";
            }
        }

        return undefined;
    }

    private static detectExpression(expression: string): Expression | null {
        if (expression.match(this.dataElementExp)) {
            const { groups = {} } = expression.match(this.dataElementExp) ?? {};
            const { dataElement, categoryOptionCombo, attributeOptionCombo } = groups;
            if (dataElement) {
                return {
                    type: "dataElement",
                    dataElement,
                    categoryOptionCombo,
                    attributeOptionCombo,
                };
            }
        }

        if (expression.match(this.programDataElementExp)) {
            const { groups = {} } = expression.match(this.programDataElementExp) ?? {};
            const { program, dataElement } = groups;
            if (program && dataElement) {
                return {
                    type: "programDataElement",
                    program,
                    dataElement,
                };
            }
        }

        if (expression.match(this.programAttributeExp)) {
            const { groups = {} } = expression.match(this.programAttributeExp) ?? {};
            const { program, attribute } = groups;
            if (program && attribute) {
                return {
                    type: "programAttribute",
                    program,
                    attribute,
                };
            }
        }

        if (expression.match(this.programIndicatorExp)) {
            const { groups = {} } = expression.match(this.programIndicatorExp) ?? {};
            const { programIndicator } = groups;
            if (programIndicator) {
                return {
                    type: "programIndicator",
                    programIndicator,
                };
            }
        }

        if (expression.match(this.reportingRateExp)) {
            const { groups = {} } = expression.match(this.reportingRateExp) ?? {};
            const { dataSet, metric } = groups;
            if (dataSet && metric) {
                return {
                    type: "reportingRate",
                    dataSet,
                    metric: metric as ReportingRateMetric,
                };
            }
        }

        if (expression.match(this.constantExp)) {
            const { groups = {} } = expression.match(this.constantExp) ?? {};
            const { constant } = groups;
            if (constant) {
                return {
                    type: "constant",
                    constant,
                };
            }
        }

        if (expression.match(this.indicatorExp)) {
            const { groups = {} } = expression.match(this.indicatorExp) ?? {};
            const { indicator } = groups;
            if (indicator) {
                return {
                    type: "indicator",
                    indicator,
                };
            }
        }

        if (expression.match(this.orgUnitGroupExp)) {
            const { groups = {} } = expression.match(this.orgUnitGroupExp) ?? {};
            const { organisationUnitGroup } = groups;
            if (organisationUnitGroup) {
                return {
                    type: "organisationUnitGroup",
                    organisationUnitGroup,
                };
            }
        }

        return null;
    }

    // Operators are in even positions
    private static isOperatorPosition(index: number) {
        return index % 2 === 0;
    }
}

export type ParserError = "MALFORMED_EXPRESSION";

export type TokenType =
    | "operator"
    | "dataElement"
    | "programDataElement"
    | "programAttribute"
    | "programIndicator"
    | "reportingRate"
    | "constant"
    | "indicator"
    | "organisationUnitGroup";

export type Operator = "+" | "-" | "*" | "/";

export type ReportingRateMetric =
    | "REPORTING_RATE"
    | "REPORTING_RATE_ON_TIME"
    | "ACTUAL_REPORTS"
    | "ACTUAL_REPORTS_ON_TIME"
    | "EXPECTED_REPORTS";

interface BaseExpression {
    type: TokenType;
}

export interface OperatorExpression extends BaseExpression {
    type: "operator";
    operator: Operator;
}

export interface DataElementExpression extends BaseExpression {
    type: "dataElement";
    dataElement: string;
    categoryOptionCombo?: string;
    attributeOptionCombo?: string;
}

export interface ProgramDataElementExpression extends BaseExpression {
    type: "programDataElement";
    program: string;
    dataElement: string;
}

export interface ProgramAttributeExpression extends BaseExpression {
    type: "programAttribute";
    program: string;
    attribute: string;
}

export interface ProgramIndicatorExpression extends BaseExpression {
    type: "programIndicator";
    programIndicator: string;
}

export interface ReportingRateExpression extends BaseExpression {
    type: "reportingRate";
    dataSet: string;
    metric: ReportingRateMetric;
}

export interface ConstantExpression extends BaseExpression {
    type: "constant";
    constant: string;
}

export interface IndicatorExpression extends BaseExpression {
    type: "indicator";
    indicator: string;
}

export interface OrganisationUnitGroupExpression extends BaseExpression {
    type: "organisationUnitGroup";
    organisationUnitGroup: string;
}

export type Expression =
    | OperatorExpression
    | DataElementExpression
    | ProgramDataElementExpression
    | ProgramAttributeExpression
    | ProgramIndicatorExpression
    | ReportingRateExpression
    | ConstantExpression
    | IndicatorExpression
    | OrganisationUnitGroupExpression;
