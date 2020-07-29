import { generateUid } from "d2/uid";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { PullRequestStatus, PullRequestType } from "../../synchronization/entities/PullRequest";
import { BaseNotification } from "./Notification";

export type PullRequestNotificationOrigin = "sent" | "received";

export interface PullRequestNotification extends BaseNotification {
    type: "pull-request";
    origin: PullRequestNotificationOrigin;
    request: {
        type: PullRequestType;
        status: PullRequestStatus;
        selectedIds: string[];
    };
}

export interface SentPullRequestNotification extends PullRequestNotification {
    origin: "sent";
}

export interface ReceivedPullRequestNotification extends PullRequestNotification {
    origin: "received";
    payload: MetadataPackage;
}

export class SentPullRequestNotification implements SentPullRequestNotification {
    static create(
        props: Omit<SentPullRequestNotification, "id" | "type" | "origin" | "read" | "created">
    ): SentPullRequestNotification {
        return {
            ...props,
            id: generateUid(),
            type: "pull-request",
            origin: "sent",
            read: false,
            created: new Date(),
        };
    }
}

export class ReceivedPullRequestNotification implements ReceivedPullRequestNotification {
    static create(
        props: Omit<ReceivedPullRequestNotification, "id" | "type" | "origin" | "read" | "created">
    ): ReceivedPullRequestNotification {
        return {
            ...props,
            id: generateUid(),
            type: "pull-request",
            origin: "received",
            read: false,
            created: new Date(),
        };
    }
}
