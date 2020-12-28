import { Instance } from "../domain/instance/entities/Instance";
import i18n from "../locales";
import { getD2APiFromInstance } from "./d2-utils";

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export async function* executeAnalytics(instance: Instance, options?: AnalyticsOptions) {
    yield i18n.t("Running analytics for instance {{name}}", instance);
    const api = getD2APiFromInstance(instance);

    const { response } = await api.analytics.run(options).getData();
    const endpoint = response.relativeNotifierEndpoint.replace("/api", "");

    let done = false;
    while (!done) {
        try {
            const response = await api.get<AnalyticsResponse>(endpoint).getData();
            const [{ message, completed }] = response ?? [];

            yield message;
            if (completed) done = true;
        } catch (e) {
            console.error(e);
        }
        await timeout(1500);
    }

    return i18n.t("Updating analytics done`for instance {{name}}", instance);
}

type AnalyticsMessage = { message: string; completed: boolean };
type AnalyticsResponse = AnalyticsMessage[] | null;

interface AnalyticsOptions {
    skipResourceTables?: boolean;
    skipAggregate?: boolean;
    skipEvents?: boolean;
    skipEnrollment?: boolean;
    lastYears?: number;
}
