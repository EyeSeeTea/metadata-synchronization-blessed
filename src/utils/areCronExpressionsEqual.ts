export const areCronExpressionsEqual = (cron1: string, cron2: string): boolean => {
    const normalize = (field: string) => field.trim().toUpperCase();

    const fields1 = cron1.trim().split(/\s+/).map(normalize);
    const fields2 = cron2.trim().split(/\s+/).map(normalize);

    if (fields1.length !== fields2.length) {
        return false;
    }

    return fields1.every((field, index) => field === fields2[index]);
};
