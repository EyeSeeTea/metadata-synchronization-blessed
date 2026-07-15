import { DataValue } from "../../aggregated/entities/DataValue";
import { TrackedEntityInstance } from "../../tracked-entity-instances/entities/TrackedEntityInstance";
import { ProgramEvent } from "./ProgramEvent";

export type EventsPayload = {
    events: ProgramEvent[];
    dataValues: DataValue[];
    trackedEntities: TrackedEntityInstance[];
};
