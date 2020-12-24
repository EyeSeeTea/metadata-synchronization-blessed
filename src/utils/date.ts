import moment from "moment";

export function formatDateLong(date: Date) {
    const momentDate = moment(date);
    return momentDate.format("YYYY-MM-DD HH:mm:ss");
}
