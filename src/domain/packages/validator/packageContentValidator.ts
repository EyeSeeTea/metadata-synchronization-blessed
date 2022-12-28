import { MetadataEntities, MetadataEntity } from "../../metadata/entities/MetadataEntities";
import { Either } from "../../common/entities/Either";
import _ from "lodash";
import { validate_O_MQ_2 } from "./validations/o_mq_2/validate_O_MQ_2";
import { validate_OG_MQ_1 } from "./validations/og_mq_1/validate_OG_MQ_1";
import { validate_SHST_MQ_1 } from "./validations/shst_mq_1/validate_SHST_MQ_1";
import { validate_ALL_MQ_16 } from "./validations/all-mq-16/validate_ALL_MQ_16";
import { validate_ALL_MQ_19 } from "./validations/all-mq-19/validate_ALL_MQ_19";

export type MetadataPackageToValidate<T = MetadataEntity> = Partial<Record<keyof MetadataEntities, Partial<T>[]>>;

export function validatePackageContents(contents: MetadataPackageToValidate): Either<string[], void> {
    const o_mq_2_errors = validate_O_MQ_2(contents);
    const og_mq_1_errors = validate_OG_MQ_1(contents);
    const shst_mq_1_errors = validate_SHST_MQ_1(contents);
    const all_mq_16_errors = validate_ALL_MQ_16(contents);
    const all_mq_19_errors = validate_ALL_MQ_19(contents);

    const errors = [...o_mq_2_errors, ...og_mq_1_errors, ...shst_mq_1_errors, ...all_mq_16_errors, ...all_mq_19_errors];

    return errors.length === 0 ? Either.success(undefined) : Either.error(errors);
}
