import { generateUid } from "d2/uid";
import { PartialBy } from "../../../types/utils";
import { PullRequestStatus, PullRequestType } from "../../synchronization/entities/PullRequest";
import { BaseNotification } from "./Notification";

export interface PullRequestNotification extends BaseNotification {
    type: "pull-request";
    request: {
        type: PullRequestType;
        status: PullRequestStatus;
        selectedIds: string[];
    };
}

export class PullRequestNotification implements PullRequestNotification {
    static create(
        props: PartialBy<PullRequestNotification, "id" | "type" | "read" | "created">
    ): PullRequestNotification {
        return {
            id: generateUid(),
            type: "pull-request",
            read: false,
            created: new Date(),
            ...props,
        };
    }
}
