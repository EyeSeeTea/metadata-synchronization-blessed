import { Ref } from "./Ref";

export interface UserInfo {
    userGroups: Ref[];
    id: string;
    name: string;
    username: string;
    isGlobalAdmin: boolean;
    isAppConfigurator: boolean;
    isAppExecutor: boolean;
}
