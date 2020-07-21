import { PullRequestStatus, PullRequestType } from "../../synchronization/entities/PullRequest";
import { Notification } from "./Notification";

interface BasePullRequestNotification {
    type: "pull-request";
    request: {
        type: PullRequestType;
        status: PullRequestStatus;
        selectedIds: string[];
    };
}

export type PullRequestNotification = BasePullRequestNotification & Notification;
