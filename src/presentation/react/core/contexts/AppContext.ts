import React, { useContext } from "react";
import { CompositionRoot } from "../../../CompositionRoot";
import { D2Api } from "../../../../types/d2-api";

export interface AppContextState {
    api: D2Api;
    d2: object;
    compositionRoot: CompositionRoot;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("Context not found");
    }
}
