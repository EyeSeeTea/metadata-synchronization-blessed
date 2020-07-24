import { generateUid } from "d2/uid";
import { PartialBy } from "../../../types/utils";
import { Ref } from "../../common/entities/Ref";
import { Id } from "../../common/entities/Schemas";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export type PullRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PullRequestType = "metadata";

export interface PullRequest extends Ref {
    instance: Id;
    type: PullRequestType;
    notification: Id;
    status: PullRequestStatus;
    payload: MetadataPackage;
}

export class PullRequest implements PullRequest {
    static create(props: PartialBy<PullRequest, "id" | "status">): PullRequest {
        return {
            id: generateUid(),
            status: "PENDING",
            ...props,
        };
    }
}
