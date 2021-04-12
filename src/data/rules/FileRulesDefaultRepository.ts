import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { FileRepository } from "../../domain/file/repositories/FileRepository";
import { SynchronizationRule } from "../../domain/rules/entities/SynchronizationRule";
import { FileRulesRepository } from "../../domain/rules/repositories/FileRulesRepository";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { decodeModel } from "../../utils/codec";
import { promiseMap } from "../../utils/common";
import { SynchronizationRuleModel } from "./models/SynchronizationRuleModel";

export class FileRulesDefaultRepository implements FileRulesRepository {
    constructor(private userRepository: UserRepository, private fileRepository: FileRepository) {}

    public async readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        const user = await this.userRepository.getCurrent();

        const items = await promiseMap(files, async file => {
            const objects = await this.fileRepository.readObjectsInFile(file, file.name);
            return objects.map(({ name, value }) =>
                decodeModel(SynchronizationRuleModel, value)
                    .map(data =>
                        SynchronizationRule.build(data).update({
                            created: new Date(),
                            user,
                            lastUpdated: new Date(),
                            lastExecutedBy: user,
                        })
                    )
                    .mapError(error => `${name}: ${error}`)
            );
        });

        return _.flatten(items);
    }
}
