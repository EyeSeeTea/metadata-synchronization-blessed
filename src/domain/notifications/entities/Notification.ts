import { NamedRef, Ref } from "../../common/entities/Ref";
import { InstanceMessage } from "../../instance/entities/Message";

export type NotificationType = "message" | "pull-request";

interface BaseNotification extends Ref {
    type: NotificationType;
    read: boolean;
    owner: NamedRef;
    created: Date;
}

export type Notification = BaseNotification & Omit<InstanceMessage, "organisationUnits">;
