import { Ref } from "./Ref";

export type Id = string;

export interface Access {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
    manage: boolean;
}

export interface AccessWithData extends Access {
    data: {
        read: boolean;
        write: boolean;
    };
}

export interface Axis {
    dimensionalItem: string;
    axis: number;
}

export interface ReportingParams {
    reportingPeriod: boolean;
    grandParentOrganisationUnit: boolean;
    parentOrganisationUnit: boolean;
    organisationUnit: boolean;
}

export interface Translation {
    property: string;
    locale: string;
    value: string;
}

export interface Style {
    color: string;
    icon: string;
}

export interface Sharing {
    publicAccess: string;
    externalAccess: boolean;
    userAccesses: Access[];
    userGroupAccesses: Access[];
}

export type Coordinates = [number, number];

export interface DimensionalKeywords {
    key: string;
    uid: Id;
    name: string;
    code: string;
}

export type Geometry =
    | { type: "Point"; coordinates: Coordinates }
    | { type: "Polygon"; coordinates: Array<Coordinates[]> }
    | { type: "MultiPolygon"; coordinates: Array<Array<Coordinates[]>> };

export type RelationshipConstraint =
    | {
          relationshipEntity: "TRACKED_ENTITY_INSTANCE";
          trackedEntityType: Ref;
          program?: Ref;
      }
    | {
          relationshipEntity: "PROGRAM_INSTANCE";
          program: Ref;
      }
    | {
          relationshipEntity: "PROGRAM_STAGE_INSTANCE";
          program: Ref;
      }
    | {
          relationshipEntity: "PROGRAM_STAGE_INSTANCE";
          programStage: Ref;
      };
