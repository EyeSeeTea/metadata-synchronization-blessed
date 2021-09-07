import _ from "lodash";
import { Either } from "../domain/common/entities/Either";

export class ExpressionParser {
    // Detects valid numbers (floats)
    private static isValidNumber = /^\d*\.?\d*?$/;

    // Detects operators in a expression (meant to be used with String.split)
    private static splitter = /(\+|-|\*|\/|%|\(|\)|>|>=|<|<=|==|!=|NOT|AND|OR|\[days\])(?![^{]*})/;
    private static operators = /(\+|-|\*|\/|%)/;
    private static parentheses = /(\(|\))/;
    private static logical = /(>|>=|<|<=|==|!=|NOT|AND|OR)/;

    // Looks up for all valid ids in a string (meant to be used with String.match)
    private static isValidUid = /[a-zA-Z]{1}[a-zA-Z0-9]{10}/g;

    // Extracts ids in named groups (meant to be used with String.match()?.groups)
    private static dataElementExp =
        /^#\{(?<dataElement>[a-zA-Z]{1}[a-zA-Z0-9]{10}).?(?<categoryOptionCombo>\*|[a-zA-Z]{1}[a-zA-Z0-9]{10})?.?(?<attributeOptionCombo>\*|[a-zA-Z]{1}[a-zA-Z0-9]{10})?\}$/;
    private static programIndicatorDataElementExp =
        /^#\{(?<programStage>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<dataElement>\*|[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programDataElementExp =
        /^D\{(?<program>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<dataElement>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programAttributeExp =
        /^A\{(?<program>[a-zA-Z]{1}[a-zA-Z0-9]{10})?.?(?<attribute>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programIndicatorExp = /^I\{(?<programIndicator>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static programVariableExp =
        /^V\{(?<variable>event_date|due_date|incident_date|current_date|completed_date|value_count|zero_pos_value_count|event_count|program_stage_name|program_stage_id|enrollment_count|tei_count|enrollment_date|enrollment_status)\}$/;
    private static reportingRateExp =
        /^R\{(?<dataSet>[a-zA-Z]{1}[a-zA-Z0-9]{10}).(?<metric>REPORTING_RATE|REPORTING_RATE_ON_TIME|ACTUAL_REPORTS|ACTUAL_REPORTS_ON_TIME|EXPECTED_REPORTS)\}$/;
    private static constantExp = /^C\{(?<constant>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static indicatorExp = /^N\{(?<indicator>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;
    private static orgUnitGroupExp = /^OUG\{(?<organisationUnitGroup>[a-zA-Z]{1}[a-zA-Z0-9]{10})\}$/;

    public static parse(type: ExpressionType, formula: string): Either<ParserError, Expression[]> {
        const results = formula
            .replace(/\s/g, "")
            .split(this.splitter)
            .filter(expression => expression !== "")
            .map(expression => this.detectExpression(type, expression));

        if (results.length === 0) return Either.error("EMPTY_EXPRESION");

        const error = this.validate(results);
        if (error) return Either.error(error);

        return Either.success(results as Expression[]);
    }

    public static build(type: ExpressionType, expressions: Expression[]): Either<ParserError, string> {
        const error = this.validate(expressions);
        if (error) return Either.error(error);

        const formula = expressions.map(expression => this.buildExpression(expression)).join(" ");
        const validation = this.parse(type, formula);
        if (validation.isError()) return Either.error("NOT_BUILDABLE");

        return Either.success(formula);
    }

    public static extractIds(formula: string): string[] {
        return formula.match(this.isValidUid) ?? [];
    }

    private static validate(expressions: Array<Expression | null>): ParserError | undefined {
        const expressionsWithoutParentheses = expressions?.filter(
            expression => expression?.type !== "parentheses" || !["(", ")"].includes(expression.parentheses)
        );

        for (const [index, expression] of expressionsWithoutParentheses.entries()) {
            if (expression === null) {
                return "MALFORMED_EXPRESSION";
            } else if (this.isOperatorPosition(index) && !["operator", "logical"].includes(expression.type)) {
                return "OPERAND_WRONG_POSITION";
            } else if (!this.isOperatorPosition(index) && ["operator", "logical"].includes(expression.type)) {
                return "OPERATOR_WRONG_POSITION";
            }
        }

        return undefined;
    }

    private static detectExpression(type: ExpressionType, expression: string): Expression | null {
        if (expression.match(this.operators)) {
            if (["+", "-", "*", "/", "%"].includes(expression)) {
                return {
                    type: "operator",
                    operator: expression as Operator,
                };
            }
        }

        if (expression.match(this.parentheses)) {
            if (["(", ")"].includes(expression)) {
                return {
                    type: "parentheses",
                    parentheses: expression as Parentheses,
                };
            }
        }

        if (expression.match(this.logical)) {
            if ([">", ">=", "<", "<=", "==", "!=", "NOT", "AND", "OR"].includes(expression)) {
                return {
                    type: "logical",
                    logical: expression as Logical,
                };
            }
        }

        if (type === "programIndicator" && expression.match(this.programIndicatorDataElementExp)) {
            const { groups = {} } = expression.match(this.programIndicatorDataElementExp) ?? {};
            const { dataElement, programStage } = groups;
            if (dataElement) {
                return {
                    type: "programIndicatorDataElement",
                    dataElement,
                    programStage,
                };
            }
        } else if (expression.match(this.dataElementExp)) {
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
            if (attribute) {
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

        if (expression.match(this.programVariableExp)) {
            const { groups = {} } = expression.match(this.programVariableExp) ?? {};
            const { variable } = groups;
            if (variable) {
                return {
                    type: "programVariable",
                    variable: variable as ProgramVariable,
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

        if (expression.match(this.isValidNumber)) {
            return {
                type: "number",
                value: parseFloat(expression),
            };
        }

        return null;
    }

    private static buildExpression(expression: Expression): string {
        switch (expression.type) {
            case "constant":
                return `C{${expression.constant}}`;
            case "dataElement":
                if (expression.attributeOptionCombo && !expression.categoryOptionCombo) return "";
                if (expression.attributeOptionCombo && !expression.dataElement) return "";
                if (expression.categoryOptionCombo && !expression.dataElement) return "";

                return `#{${_.compact(
                    _.compact([expression.dataElement, expression.categoryOptionCombo, expression.attributeOptionCombo])
                ).join(".")}}`;
            case "programIndicatorDataElement":
                return `#{${_.compact(_.compact([expression.programStage, expression.dataElement])).join(".")}}`;
            case "indicator":
                return `N{${expression.indicator}}`;
            case "number":
                return `${expression.value}`;
            case "operator":
                return expression.operator;
            case "organisationUnitGroup":
                return `OUG{${expression.organisationUnitGroup}}`;
            case "parentheses":
                return expression.parentheses;
            case "logical":
                return expression.logical;
            case "programAttribute":
                return `A{${_.compact([expression.program, expression.attribute]).join(".")}}`;
            case "programDataElement":
                return `D{${[expression.program, expression.dataElement].join(".")}}`;
            case "programIndicator":
                return `I{${expression.programIndicator}}`;
            case "programVariable":
                return `V{${expression.variable}}`;
            case "reportingRate":
                return `R{${[expression.dataSet, expression.metric].join(".")}}`;
            default:
                return "";
        }
    }

    // Operators are in odd positions
    private static isOperatorPosition(index: number) {
        return index % 2 !== 0;
    }
}

export type ParserError =
    | "MALFORMED_EXPRESSION"
    | "EMPTY_EXPRESION"
    | "NOT_BUILDABLE"
    | "OPERATOR_WRONG_POSITION"
    | "OPERAND_WRONG_POSITION";

export type TokenType =
    | "number"
    | "operator"
    | "parentheses"
    | "logical"
    | "dataElement"
    | "programIndicatorDataElement"
    | "programDataElement"
    | "programAttribute"
    | "programIndicator"
    | "programVariable"
    | "reportingRate"
    | "constant"
    | "indicator"
    | "organisationUnitGroup";

export type Operator = "+" | "-" | "*" | "/" | "%";
export type Parentheses = "(" | ")";
export type Logical = ">" | ">=" | "<" | "<=" | "==" | "!=" | "NOT" | "AND" | "OR";

export type ReportingRateMetric =
    | "REPORTING_RATE"
    | "REPORTING_RATE_ON_TIME"
    | "ACTUAL_REPORTS"
    | "ACTUAL_REPORTS_ON_TIME"
    | "EXPECTED_REPORTS";

export type ProgramVariable =
    | "event_date"
    | "due_date"
    | "incident_date"
    | "current_date"
    | "completed_date"
    | "value_count"
    | "zero_pos_value_count"
    | "event_count"
    | "program_stage_name"
    | "program_stage_id"
    | "enrollment_count"
    | "tei_count"
    | "enrollment_date"
    | "enrollment_status";

interface BaseExpression {
    type: TokenType;
}

export interface NumberExpression extends BaseExpression {
    type: "number";
    value: number;
}

export interface OperatorExpression extends BaseExpression {
    type: "operator";
    operator: Operator;
}

export interface ParenthesesExpression extends BaseExpression {
    type: "parentheses";
    parentheses: Parentheses;
}

export interface LogicalExpression extends BaseExpression {
    type: "logical";
    logical: Logical;
}

export interface DataElementExpression extends BaseExpression {
    type: "dataElement";
    dataElement: string;
    categoryOptionCombo?: string;
    attributeOptionCombo?: string;
}

export interface ProgramIndicatorDataElementExpression extends BaseExpression {
    type: "programIndicatorDataElement";
    dataElement: string;
    programStage: string;
}

export interface ProgramDataElementExpression extends BaseExpression {
    type: "programDataElement";
    program: string;
    dataElement: string;
}

export interface ProgramAttributeExpression extends BaseExpression {
    type: "programAttribute";
    program?: string;
    attribute: string;
}

export interface ProgramIndicatorExpression extends BaseExpression {
    type: "programIndicator";
    programIndicator: string;
}

export interface ProgramVariableExpression extends BaseExpression {
    type: "programVariable";
    variable: string;
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
    | NumberExpression
    | OperatorExpression
    | ParenthesesExpression
    | LogicalExpression
    | DataElementExpression
    | ProgramIndicatorDataElementExpression
    | ProgramDataElementExpression
    | ProgramAttributeExpression
    | ProgramIndicatorExpression
    | ProgramVariableExpression
    | ReportingRateExpression
    | ConstantExpression
    | IndicatorExpression
    | OrganisationUnitGroupExpression;

export type ExpressionType = "indicator" | "programIndicator" | "predictor";
