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
