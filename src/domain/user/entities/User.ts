import { NamedRef } from "../../common/entities/Ref";

export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    userGroups: NamedRef[];
    organisationUnits: NamedRef[];
    dataViewOrganisationUnits: NamedRef[];
    isGlobalAdmin: boolean;
    isAppConfigurator: boolean;
    isAppExecutor: boolean;
}
