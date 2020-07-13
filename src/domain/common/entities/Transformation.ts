export interface Transformation<Input, Output> {
    apiVersion: number;
    transform(payload: Input): Output;
}
