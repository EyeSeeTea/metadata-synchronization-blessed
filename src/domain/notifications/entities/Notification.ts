import { PartialBy } from "../../../types/utils";
import { NamedRef } from "../../common/entities/Ref";
import { PublicInstance } from "../../instance/entities/Instance";
import { ReceivedPullRequestNotification, SentPullRequestNotification } from "./PullRequestNotification";

export type NotificationType = "message" | "received-pull-request" | "sent-pull-request";

export interface BaseNotification {
    id: string;
    subject: string;
    text: string;
    type: NotificationType;
    read: boolean;
    instance: PublicInstance;
    owner: NamedRef;
    created: Date;
    users: PartialBy<NamedRef, "name">[];
    userGroups: PartialBy<NamedRef, "name">[];
}

export interface MessageNotification extends BaseNotification {
    type: "message";
}

export type AppNotification = MessageNotification | ReceivedPullRequestNotification | SentPullRequestNotification;
