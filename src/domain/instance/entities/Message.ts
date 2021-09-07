import { Ref } from "../../common/entities/Ref";
import { RequireAtLeastOne } from "../../../types/utils";

export interface BaseMessage {
    subject: string;
    text: string;
    users?: Ref[];
    userGroups?: Ref[];
    organisationUnits?: Ref[];
}

export type InstanceMessage = RequireAtLeastOne<BaseMessage, "users" | "userGroups" | "organisationUnits">;
