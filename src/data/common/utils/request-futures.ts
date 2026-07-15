import axios, { AxiosRequestConfig } from "axios";
import { Future, FutureData } from "../../../domain/common/entities/Future";

export function getJsonToFuture<T>(url: string, config?: AxiosRequestConfig<any>): FutureData<T> {
    return Future.fromPromise(
        axios.get<T>(url, {
            ...config,
            responseType: "json",
            headers: {
                ...config?.headers,
                Accept: "application/json",
            },
        })
    ).map(response => response.data);
}
