import { Either } from "../../common/entities/Either";
import { FileRepository } from "../../file/repositories/FileRepository";
import { UserRepository } from "../../user/repositories/UserRepository";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface FileRulesRepositoryConstructor {
    new (userRepository: UserRepository, fileRepository: FileRepository): FileRulesRepository;
}

export interface FileRulesRepository {
    readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]>;
}
