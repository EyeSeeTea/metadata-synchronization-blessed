import { NamedRef } from "../../common/entities/Ref";
import { InstanceMessage } from "../../instance/entities/Message";
import { PullRequestNotification } from "./PullRequestNotification";

export type NotificationType = "message" | "pull-request";

export interface BaseNotification extends Omit<InstanceMessage, "organisationUnits"> {
    id: string;
    type: NotificationType;
    read: boolean;
    owner: NamedRef;
    created: Date;
}

export interface MessageNotification extends BaseNotification {
    type: "message";
}

export type AppNotification = MessageNotification | PullRequestNotification;
