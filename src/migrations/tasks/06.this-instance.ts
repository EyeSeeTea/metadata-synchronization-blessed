import _ from "lodash";
import { Instance, InstanceData } from "../../domain/instance/entities/Instance";
import { D2Api } from "../../types/d2-api";
import { Migration } from "../types";

export async function migrate(api: D2Api): Promise<void> {
    const dataStore = api.dataStore("metadata-synchronization");
    const oldContents = await dataStore.get<InstanceData[]>("instances").getData();
    if (!oldContents) return;

    const oldInstances = oldContents.map(({ name, ...rest }) =>
        Instance.build({
            ...rest,
            name:
                name === "This instance"
                    ? `Local Instance with user ${rest.username ?? "unknown"}`
                    : name,
        }).toObject()
    );

    const localInstance = Instance.build({
        type: "local",
        id: "LOCAL",
        name: "This instance",
        url: api.baseUrl,
    }).toObject();

    const instances = _.uniqBy([localInstance, ...oldInstances], "id");

    await dataStore.save("instances", instances).getData();
}

const migration: Migration = { name: "Update history notifications", migrate };

export default migration;
