import { Either } from "../../common/entities/Either";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface FileRulesRepository {
    readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]>;
}
