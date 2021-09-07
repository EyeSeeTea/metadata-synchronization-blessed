import _ from "lodash";
import { EventsSyncUseCase } from "../../../../../domain/events/usecases/EventsSyncUseCase";
import { MetadataEntity, Program, ProgramStage } from "../../../../../domain/metadata/entities/MetadataEntities";
import { CompositionRoot } from "../../../../CompositionRoot";
import { CustomProgram } from "./data/EventsSelectionStep";

export async function extractAllPrograms<T = Program | CustomProgram>(
    compositionRoot: CompositionRoot,
    eventsSyncUseCase: EventsSyncUseCase
): Promise<T[]> {
    const originInstance = await eventsSyncUseCase.getOriginInstance();

    return eventsSyncUseCase
        .extractMetadata<MetadataEntity>(originInstance)
        .then(({ programs = [], programStages = [] }) => {
            const programStageIds = programStages.map(({ id }) => id);

            const programsIdsByStage = _((programStages as ProgramStage[]).map(({ program }) => program.id))
                .uniq()
                .value();

            if (programsIdsByStage.length > 0) {
                return compositionRoot.metadata
                    .getByIds(programsIdsByStage, originInstance, eventsSyncUseCase.fields)
                    .then(({ programs: programsByStages = [] }) => {
                        const newPrograms = programsByStages.map(program => {
                            const programByStage = program as Program;
                            return {
                                ...programByStage,
                                programStages: programByStage.programStages.filter(stage =>
                                    programStageIds.includes(stage.id)
                                ),
                            };
                        });

                        const finalPrograms = _([...(programs as unknown as T[]), ...(newPrograms as unknown as T[])])
                            .uniqBy("id")
                            .value() as T[];

                        return finalPrograms as T[];
                    });
            } else {
                return programs as unknown as T[];
            }
        });
}
