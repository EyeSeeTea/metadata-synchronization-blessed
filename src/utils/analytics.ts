import { Instance } from "../domain/instance/entities/Instance";
import i18n from "../locales";
import { getD2APiFromInstance } from "./d2-utils";

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export async function* executeAnalytics(instance: Instance) {
    yield i18n.t("Running analytics for instance {{name}}", instance);
    const api = getD2APiFromInstance(instance);

    const { response } = await api.analytics.run().getData();

    let done = false;
    while (!done) {
        try {
            const [{ message, completed }] =
                (await (api
                    .get(response.relativeNotifierEndpoint.replace("/api", ""))
                    .getData() as Promise<{ message: string; completed: boolean }[]>)) ?? [];

            yield message;
            if (completed) done = true;
        } catch (e) {
            console.error(e);
        }
        await timeout(1500);
    }

    return i18n.t("Updating analytics done`for instance {{name}}", instance);
}
