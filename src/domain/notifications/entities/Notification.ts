import { Message } from "../../instance/entities/Message";
import { NamedRef } from "../../common/entities/Ref";

interface BaseNotification {
    read: boolean;
    owner: NamedRef;
    created: Date;
}

export type Notification = BaseNotification & Message;
