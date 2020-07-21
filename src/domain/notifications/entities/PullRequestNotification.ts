import { PullRequestStatus, PullRequestType } from "../../synchronization/entities/PullRequest";

export interface PullRequestNotification extends Notification {
    type: PullRequestType;
    status: PullRequestStatus;
}
