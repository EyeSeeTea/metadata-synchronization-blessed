import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../contexts/AppContext";
import { SchedulerExecutionInfo } from "../../../../../domain/scheduler/entities/SchedulerExecutionInfo";

// NOTICE: This is refactored

export type SchedulerInfoState = {
    status: boolean;
    errorMessage: string;
};

export function useSchedulerInfo(onSchedulerRun?: (timestamp: string) => void): SchedulerInfoState {
    const { compositionRoot } = useAppContext();

    const [status, setStatus] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isRunning = useCallback((info?: SchedulerExecutionInfo) => {
        return !!info?.nextExecution && info.nextExecution >= new Date();
    }, []);

    const getSchedulerInfo = useCallback(() => {
        compositionRoot.scheduler.getLastExecutionInfo().run(
            lastExecutionInfo => {
                const timestamp = lastExecutionInfo?.lastExecution?.toISOString() ?? "";
                if (onSchedulerRun) onSchedulerRun(timestamp);
                return setStatus(isRunning(lastExecutionInfo));
            },
            err => {
                console.debug(err);
                setErrorMessage(err.message);
            }
        );
    }, [compositionRoot.scheduler, isRunning, onSchedulerRun]);

    useEffect(() => {
        getSchedulerInfo();
        const intervalId = setInterval(() => getSchedulerInfo(), 60 * 1000);
        return () => clearInterval(intervalId);
    }, [getSchedulerInfo, setStatus]);

    return {
        status: status,
        errorMessage: errorMessage,
    };
}
