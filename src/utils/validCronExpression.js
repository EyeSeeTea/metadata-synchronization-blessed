const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const isValidFields = fields => fields && fields.length === 6;
const isInteger = value => typeof value === "string" && /^\d+$/.test(value);
const isValidNumber = (value, min, max) => {
    if (!isInteger(value)) return false;
    const number = Number(value);
    return number >= min && number <= max;
};
const isWildcard = field => field === "*";
const isUndefined = field => field === "?";
const hasExactSingleSpaces = exp => /^[^\s]+( [^\s]+){5}$/.test(exp);

const isValidNumberRange = (range, min, max) => {
    const boundaries = range.split("-");
    if (boundaries.length !== 2) return false;

    const [start, end] = boundaries;

    if (!isValidNumber(start, min, max) || !isValidNumber(end, min, max)) return false;

    return Number(start) <= Number(end);
};

const isValidFraction = (fraction, min, max) => {
    const components = fraction.split("/");
    if (components.length !== 2) return false;

    const [base, step] = components;

    const baseOk = isWildcard(base) || isValidNumber(base, min, max) || isValidNumberRange(base, min, max);

    if (!baseOk) return false;

    if (!isInteger(step)) return false;
    const stepNum = Number(step);
    return stepNum >= 1 && stepNum <= max;
};

const isAlphabeticWeekday = field => {
    const weekdays = field.split("-");
    const [firstDay, secondDay] = weekdays.map(c => WEEKDAYS.indexOf(c));
    return (
        (firstDay !== -1 && secondDay === undefined) || (firstDay !== -1 && secondDay !== -1 && firstDay <= secondDay)
    );
};

const isAlphabeticMonth = field => {
    const months = field.split("-");
    const [firstMonth, secondMonth] = months.map(m => MONTHS.indexOf(m));
    return (
        (firstMonth !== -1 && secondMonth === undefined) ||
        (firstMonth !== -1 && secondMonth !== -1 && firstMonth <= secondMonth)
    );
};

const isValidWithinRange = (field, min, max) =>
    isWildcard(field) ||
    isValidNumber(field, min, max) ||
    isValidNumberRange(field, min, max) ||
    isValidFraction(field, min, max);

const isValidSecondField = field => isValidWithinRange(field, 0, 59);
const isValidMinuteField = field => isValidWithinRange(field, 0, 59);
const isValidHourField = field => isValidWithinRange(field, 0, 23);
const isValidDayField = field => isUndefined(field) || isValidWithinRange(field, 1, 31);
const isValidMonthField = field => isValidWithinRange(field, 1, 12) || isAlphabeticMonth(field);
const isValidWeekdayField = field =>
    isUndefined(field) || isValidWithinRange(field, 1, 7) || isAlphabeticWeekday(field);

// isValidation of CronExpression, following the Spring Scheduling pattern:
// - Documentation: https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/scheduling/support/CronSequenceGenerator.html
// - Source code: https://git.io/vpoqG
const isValidCronExpression = exp => {
    if (!exp) {
        return false;
    }

    if (!hasExactSingleSpaces(exp)) return false;

    const fields = exp.split(" ");
    if (!isValidFields(fields)) {
        return false;
    }

    return (
        isValidSecondField(fields[0]) &&
        isValidMinuteField(fields[1]) &&
        isValidHourField(fields[2]) &&
        isValidDayField(fields[3]) &&
        isValidMonthField(fields[4]) &&
        isValidWeekdayField(fields[5])
    );
};

export default isValidCronExpression;
