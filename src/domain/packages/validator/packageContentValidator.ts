import { MetadataEntities, MetadataEntity } from "../../metadata/entities/MetadataEntities";
import { Either } from "../../common/entities/Either";
import _ from "lodash";
import { validate_O_MQ_2 } from "./validations/o_mq_2/validate_O_MQ_2";

export type MetadataPackageToValidate<T = MetadataEntity> = Partial<Record<keyof MetadataEntities, Partial<T>[]>>;

export function validatePackageContents(contents: MetadataPackageToValidate): Either<string[], void> {
    const o_mq_2_errors = validate_O_MQ_2(contents);

    const errors = [...o_mq_2_errors];

    return errors.length === 0 ? Either.success(undefined) : Either.error(errors);
}
