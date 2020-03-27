import i18n from "@dhis2/d2-i18n";
import Instance from "../models/instance";

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export async function* executeAnalytics(instance: Instance) {
    yield i18n.t("Running analytics for instance {{name}}", instance);
    const { response } = await instance
        .getApi()
        .analytics.run()
        .getData();

    let done = false;
    while (!done) {
        try {
            const [{ message, completed }] =
                (await (instance
                    .getApi()
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
