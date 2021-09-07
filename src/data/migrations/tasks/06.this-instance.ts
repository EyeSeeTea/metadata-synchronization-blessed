import _ from "lodash";
import { Instance, InstanceData } from "../../../domain/instance/entities/Instance";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { AppStorage, Migration } from "../client/types";
import { MigrationParams } from "./index";

export async function migrate(storageClient: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const oldContents = await storageClient.get<InstanceData[]>("instances");
    if (!oldContents) return;

    const oldInstances = oldContents.map(({ name, ...rest }) =>
        _.omit(
            Instance.build({
                ...rest,
                name: name === "This instance" ? `Local Instance with user ${rest.username ?? "unknown"}` : name,
            }).toObject(),
            "publicAccess",
            "userAccesses",
            "externalAccess",
            "userGroupAccesses",
            "user",
            "created",
            "lastUpdated",
            "lastUpdatedBy"
        )
    );

    const localInstance = Instance.build({
        type: "local",
        id: "LOCAL",
        name: "This instance",
        url: "",
    }).toObject();

    const instances = _.uniqBy([localInstance, ...oldInstances], "id");

    await storageClient.save("instances", instances);
}

const migration: Migration<MigrationParams> = { name: "Update history notifications", migrate };

export default migration;
