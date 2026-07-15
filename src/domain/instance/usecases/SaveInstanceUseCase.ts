import i18n from "../../../utils/i18n";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { Instance } from "../entities/Instance";
import { InstanceRepository } from "../repositories/InstanceRepository";

export class SaveInstanceUseCase implements UseCase {
    constructor(private instanceRepository: InstanceRepository) {}

    public async execute(instance: Instance): Promise<ValidationError[]> {
        const instances = await this.instanceRepository.getAll({});
        const instanceByName = instances?.find(existed => existed.name === instance.name);

        if (instanceByName && instanceByName.id !== instance.id) {
            return [
                {
                    property: "name",
                    error: "name_exists",
                    description: i18n.t("An instance with this name already exists"),
                },
            ];
        }

        const existedInstance = instances?.find(existed => existed.id === instance.id);

        if (existedInstance && existedInstance.type !== instance.type) {
            return [
                {
                    property: "type",
                    error: "type_immutable",
                    description: i18n.t("The instance type cannot be changed after the instance is created"),
                },
            ];
        }

        if (
            existedInstance &&
            instance.type === "aggregated-data-exchange" &&
            existedInstance.type === "aggregated-data-exchange" &&
            existedInstance.exchangeTargetType !== instance.exchangeTargetType
        ) {
            return [
                {
                    property: "exchangeTargetType",
                    error: "exchange_target_type_immutable",
                    description: i18n.t("The exchange target type cannot be changed after the instance is created"),
                },
            ];
        }

        if (instance.isInternalDataExchange) {
            const existedInternalAdexInstance = instances?.find(
                existed => existed.isInternalDataExchange && existed.id !== instance.id
            );

            if (existedInternalAdexInstance) {
                return [
                    {
                        property: "exchangeTargetType",
                        error: "internal_exists",
                        description: i18n.t(
                            "An internal Aggregated Data Exchange instance already exists: {{instanceName}}",
                            { instanceName: existedInternalAdexInstance.name, nsSeparator: false }
                        ),
                    },
                ];
            }
        }

        const existedAdexInstanceByUrl =
            instance.type === "aggregated-data-exchange" && !instance.isInternalDataExchange
                ? instances?.find(
                      existed =>
                          existed.type === "aggregated-data-exchange" &&
                          !existed.isInternalDataExchange &&
                          existed.url === instance.url
                  )
                : undefined;

        if (existedAdexInstanceByUrl && existedAdexInstanceByUrl.id !== instance.id) {
            return [
                {
                    property: "url",
                    error: "url_exists",
                    description: i18n.t(
                        "An Aggregated Data Exchange instance with this URL already exists: {{instanceName}}",
                        { instanceName: existedAdexInstanceByUrl.name, nsSeparator: false }
                    ),
                },
            ];
        }

        // Validate model and save it if there're no errors
        const modelValidations = instance.validate();
        if (modelValidations.length > 0) return modelValidations;

        await this.instanceRepository.save(instance);

        return [];
    }
}
