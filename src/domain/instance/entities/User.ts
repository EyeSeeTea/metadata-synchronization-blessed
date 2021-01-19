import { NamedRef } from "../../common/entities/Ref";

export interface User {
    id: string;
    name: string;
    email: string;
    userGroups: NamedRef[];
    organisationUnits: NamedRef[];
    dataViewOrganisationUnits: NamedRef[];
}
