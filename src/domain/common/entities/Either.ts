export abstract class Either<Data, Error> {
    constructor(public readonly data?: Data, public readonly error?: Error) {}

    isFailure(): boolean {
        return this instanceof Failure;
    }

    isSuccess(): boolean {
        return this instanceof Success;
    }

    map<T>(fn: (r?: Data) => T): Either<T, Error> {
        return this.flatMap(r => new Success<T>(fn(r)));
    }

    flatMap<T>(fn: (data?: Data) => Either<T, Error>): Either<T, Error> {
        return this.isFailure() ? new Failure<Error>(undefined, this.error) : fn(this.data);
    }

    fold<T>(errorFn: (error: Error) => T, dataFn: (data?: Data) => T): T {
        return this.isFailure() ? errorFn(this.error as Error) : dataFn(this.data);
    }

    static Failure<Error>(error: Error) {
        return new Failure<Error>(undefined, error);
    }

    static Success<Data>(data: Data) {
        return new Success<Data>(data);
    }
}

export class Failure<Error> extends Either<never, Error> {}

export class Success<Data> extends Either<Data, never> {}
