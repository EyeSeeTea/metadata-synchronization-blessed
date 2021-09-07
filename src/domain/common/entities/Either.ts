type EitherValueError<Error> = { type: "error"; error: Error; data?: never };
type EitherValueSuccess<Data> = { type: "success"; error?: never; data: Data };
type EitherValue<Error, Data> = EitherValueError<Error> | EitherValueSuccess<Data>;

type MatchObject<Error, Data, Res> = {
    success: (data: Data) => Res;
    error: (error: Error) => Res;
};

export class Either<Error, Data> {
    constructor(public value: EitherValue<Error, Data>) {}

    match<Res>(matchObj: MatchObject<Error, Data, Res>): Res {
        switch (this.value.type) {
            case "success":
                return matchObj.success(this.value.data);
            case "error":
                return matchObj.error(this.value.error);
        }
    }

    isError(): this is this & { value: EitherValueError<Error> } {
        return this.value.type === "error";
    }

    isSuccess(): this is this & { value: EitherValueSuccess<Data> } {
        return this.value.type === "success";
    }

    map<Data1>(fn: (data: Data) => Data1): Either<Error, Data1> {
        return this.flatMap(data => new Either<Error, Data1>({ type: "success", data: fn(data) }));
    }

    mapError<Error1>(fn: (error: Error) => Error1): Either<Error1, Data> {
        return this.flatMapError(error => new Either<Error1, Data>({ type: "error", error: fn(error) }));
    }

    flatMap<Data1>(fn: (data: Data) => Either<Error, Data1>): Either<Error, Data1> {
        return this.match({
            success: data => fn(data),
            error: () => this as Either<Error, any>,
        });
    }

    flatMapError<Error1>(fn: (error: Error) => Either<Error1, Data>): Either<Error1, Data> {
        return this.match({
            success: () => this as Either<any, Data>,
            error: error => fn(error),
        });
    }

    static error<Error>(error: Error) {
        return new Either<Error, never>({ type: "error", error });
    }

    static success<Error, Data>(data: Data) {
        return new Either<Error, Data>({ type: "success", data });
    }

    static map2<Error, Res, Data1, Data2>(
        [either1, either2]: [Either<Error, Data1>, Either<Error, Data2>],
        fn: (data1: Data1, data2: Data2) => Res
    ): Either<Error, Res> {
        return either1.flatMap<Res>(data1 => {
            return either2.map<Res>(data2 => fn(data1, data2));
        });
    }
}
