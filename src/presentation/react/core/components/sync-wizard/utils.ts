import _ from "lodash";
import { EventsSyncUseCase } from "../../../../../domain/events/usecases/EventsSyncUseCase";
import { MetadataEntity, Program } from "../../../../../domain/metadata/entities/MetadataEntities";
import { CompositionRoot } from "../../../../CompositionRoot";
import { CustomProgram } from "./data/EventsSelectionStep";

export async function extractAllPrograms<T = Program | CustomProgram>(
    compositionRoot: CompositionRoot,
    eventsSyncUseCase: EventsSyncUseCase,
    fields?: object
): Promise<T[]> {
    return eventsSyncUseCase
        .extractMetadata<MetadataEntity>()
        .then(({ programs = [], programStages = [] }) => {
            const programStageIds = programStages.map(({ id }) => id);
            if (programStages.length > 0) {
                return compositionRoot.metadata
                    .listAll({
                        type: "programs",
                        fields,
                        childrenPropInList: {
                            prop: "programStages.id",
                            values: programStageIds,
                        },
                    })
                    .then(programsByStages => {
                        const newPrograms = programsByStages.map(program => {
                            const programByStage = program as Program;
                            return {
                                ...programByStage,
                                programStages: programByStage.programStages.filter(stage =>
                                    programStageIds.includes(stage.id)
                                ),
                            };
                        });

                        const finalPrograms = _([
                            ...((programs as unknown) as T[]),
                            ...((newPrograms as unknown) as T[]),
                        ])
                            .uniqBy("id")
                            .value() as T[];

                        return finalPrograms as T[];
                    });
            } else {
                return (programs as unknown) as T[];
            }
        });
}
