import { Id } from "../../common/entities/Schemas";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export type PullRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PullRequestType = "metadata";

export interface PullRequest {
    instance: Instance;
    type: PullRequestType;
    notification: Id;
    status: PullRequestStatus;
    payload: MetadataPackage;
}
