import { Id } from "../../common/entities/Schemas";
import { Visualization } from "../entities/Visualization";

export interface VisualizationRepository {
    getByIds(ids: Id[]): Promise<Visualization[]>;
}
