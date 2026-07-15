import { Either } from "../../common/entities/Either";
import { generateUid } from "../../common/entities/uid";
import { ModelValidation, validateModel, ValidationError } from "../../common/entities/Validations";
import { ValueObject } from "../../common/value-objects/ValueObject";

export type RuleAggregatedDataExchangeProps = {
    id: string;
    target: RuleAggregatedDataExchangeTarget;
};

type RuleAggregatedDataExchangeTarget = {
    instanceId: string;
    type: "external" | "internal";
    authType: "http-basic" | "api-token";
    username?: string;
    password?: string;
    token?: string;
};

export class RuleAggregatedDataExchange extends ValueObject<RuleAggregatedDataExchangeProps> {
    public readonly id: string;
    public readonly target: RuleAggregatedDataExchangeTarget;

    private constructor(protected props: RuleAggregatedDataExchangeProps) {
        super(props);

        this.id = props.id;
        this.target = props.target;
    }

    public replicate(): RuleAggregatedDataExchange {
        return new RuleAggregatedDataExchange({ ...this.props, id: generateUid() });
    }

    public get isMissingCredentials(): boolean {
        if (this.target.type === "internal") return false;

        return this.target.authType === "http-basic"
            ? !this.target.username || !this.target.password
            : !this.target.token;
    }

    public static create(
        props: RuleAggregatedDataExchangeProps
    ): Either<ValidationError[], RuleAggregatedDataExchange> {
        const authTargetValidations: ModelValidation[] =
            props.target.type === "internal"
                ? []
                : props.target.authType === "http-basic"
                ? [
                      {
                          property: "username",
                          validation: "hasValue",
                          alias: "target.username",
                      },
                      {
                          property: "password",
                          validation: "hasValue",
                          alias: "target.password",
                      },
                  ]
                : [
                      {
                          property: "token",
                          validation: "hasValue",
                          alias: "target.token",
                      },
                  ];

        return RuleAggregatedDataExchange.validateAndCreate(authTargetValidations, {
            ...props,
            id: props.id || generateUid(),
        });
    }

    public static createExisted(
        props: RuleAggregatedDataExchangeProps
    ): Either<ValidationError[], RuleAggregatedDataExchange> {
        const authTargetValidations: ModelValidation[] =
            props.target.type !== "internal" && props.target.authType === "http-basic"
                ? [
                      {
                          property: "username",
                          validation: "hasValue",
                          alias: "target.username",
                      },
                  ]
                : [];

        return RuleAggregatedDataExchange.validateAndCreate(authTargetValidations, props);
    }

    public toProps(): RuleAggregatedDataExchangeProps {
        return {
            id: this.id,
            target: this.target,
        };
    }

    private static validateAndCreate(
        authTargetValidations: ModelValidation[],
        props: RuleAggregatedDataExchangeProps
    ): Either<ValidationError[], RuleAggregatedDataExchange> {
        const fixedTargetValidations: ModelValidation[] = [
            {
                property: "instanceId",
                validation: "hasValue",
                alias: "target.instanceId",
            },
        ];

        const allTargetValidations = [...fixedTargetValidations, ...authTargetValidations];

        const targetErrors = validateModel<RuleAggregatedDataExchangeTarget>(props.target, allTargetValidations);

        const ruleAdexValidations: ModelValidation[] = [
            {
                property: "id",
                validation: "hasValue",
                alias: "id",
            },
        ];

        const adexErrors = validateModel<RuleAggregatedDataExchangeProps>(props, ruleAdexValidations);

        return targetErrors.length > 0 || adexErrors.length > 0
            ? Either.error([...targetErrors, ...adexErrors])
            : Either.success(new RuleAggregatedDataExchange({ id: props.id, target: props.target }));
    }
}
