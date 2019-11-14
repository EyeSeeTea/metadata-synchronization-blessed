import React, { useContext } from "react";
import { D2Api, D2ApiDefault } from "d2-api";

interface Context {
    api: D2Api;
    d2: object;
}
const defaultValue = {
    api: new D2ApiDefault({ baseUrl: "http://localhost:8080" }),
    d2: {},
};

export const ApiContext = React.createContext<Context>(defaultValue);

export function useD2() {
    return useContext(ApiContext).d2;
}

export function useD2Api() {
    return useContext(ApiContext).api;
}
