import { NamedRef } from "../../common/entities/Ref";
import { PublicInstance } from "../../instance/entities/Instance";
import { InstanceMessage } from "../../instance/entities/Message";
import {
    ReceivedPullRequestNotification,
    SentPullRequestNotification,
} from "./PullRequestNotification";

export type NotificationType = "message" | "received-pull-request" | "sent-pull-request";

export interface BaseNotification extends Omit<InstanceMessage, "organisationUnits"> {
    id: string;
    type: NotificationType;
    read: boolean;
    instance: PublicInstance;
    owner: NamedRef;
    created: Date;
}

export interface MessageNotification extends BaseNotification {
    type: "message";
}

export type AppNotification =
    | MessageNotification
    | ReceivedPullRequestNotification
    | SentPullRequestNotification;
