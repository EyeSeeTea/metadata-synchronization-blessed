import { Either } from "../../common/entities/Either";
import { ConfigRepository } from "../../config/repositories/ConfigRepository";
import { FileRepository } from "../../file/repositories/FileRepository";
import { UserRepository } from "../../user/repositories/UserRepository";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface RulesRepositoryConstructor {
    new (
        configRepository: ConfigRepository,
        userRepository: UserRepository,
        fileRepository: FileRepository
    ): RulesRepository;
}

export interface RulesRepository {
    getById(id: string): Promise<SynchronizationRule | undefined>;
    list(): Promise<SynchronizationRule[]>;
    save(rules: SynchronizationRule[]): Promise<void>;
    delete(id: string): Promise<void>;
    readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]>;
}
