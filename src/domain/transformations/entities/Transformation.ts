export interface Transformation {
    name?: string;
    apiVersion: number;
    apply?<Input, Output>(payload: Input): Output;
    undo?<Input, Output>(payload: Input): Output;
}
