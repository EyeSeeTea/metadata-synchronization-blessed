import { useState, useEffect } from "react";
import { D2ApiResponse } from "d2-api";

interface D2ApiHookState<Data> {
    loading: boolean;
    data?: Data;
    error?: Error;
}

interface D2ApiHookResponse<Data> extends D2ApiHookState<Data> {
    refetch(query: D2ApiResponse<Data>): void;
}

export const useD2ApiData = <T>(apiQuery: D2ApiResponse<T>): D2ApiHookResponse<T> => {
    const [state, setState] = useState<D2ApiHookState<T>>({ loading: true });
    const [query, refetch] = useState<D2ApiResponse<T>>(apiQuery);

    useEffect(() => {
        const { cancel, response } = query;
        response
            .then(({ data }) => {
                setState({ loading: false, data });
            })
            .catch(error => {
                setState({ loading: false, error });
            });

        return cancel;
    }, [query, setState]);

    return { ...state, refetch };
};
