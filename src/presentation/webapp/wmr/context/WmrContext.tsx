import React from "react";
import { Id } from "../../../../domain/common/entities/Schemas";
import { WmrSettings } from "../../../../domain/entities/wmr/entities/WmrSettings";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";
import { Maybe } from "../../../../types/utils";

export type WmrSyncRule = { localDataSetId: Maybe<Id>; rule: SynchronizationRule; targetOrgUnitId: Maybe<Id> };

export interface WmrContextState {
    loadSettings: () => void;
    settings: Maybe<WmrSettings>;
    syncRule: Maybe<WmrSyncRule>;
    requisitesReady: boolean;
    setRequisitesReady: (ready: boolean) => void;
}

export const WmrContext = React.createContext<WmrContextState | null>(null);

export function useWmrContext() {
    const context = React.useContext(WmrContext);
    if (context) {
        return context;
    } else {
        throw new Error("WMR Context not found");
    }
}
