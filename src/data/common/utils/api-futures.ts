import { Future, FutureData } from "../../../domain/common/entities/Future";
import { CancelableResponse } from "../../../types/d2-api";

/**
 * @description This file is refactored
 */
export function apiToFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch((err: unknown) => {
                if (err instanceof Error) {
                    reject(err);
                } else {
                    console.error("apiToFuture:uncatched", err);
                    reject(new Error("Unknown error"));
                }
            });
        return res.cancel;
    });
}
