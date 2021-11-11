import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { SchedulerExecution } from "../../../../../domain/scheduler/entities/SchedulerExecution";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";

export interface SchedulerInfoProps {
    onSchedulerRun?: (timestamp: string) => void;
}

export const SchedulerInfo: React.FC<SchedulerInfoProps> = React.memo(props => {
    const { onSchedulerRun } = props;
    const { compositionRoot } = useAppContext();
    const [status, setStatus] = useState<boolean>(false);

    const getSchedulerInfo = useCallback(() => {
        compositionRoot.scheduler.getLastExecution().then(execution => {
            const timestamp = execution?.lastExecution?.toISOString() ?? "";
            if (onSchedulerRun) onSchedulerRun(timestamp);
            return setStatus(isRunning(execution));
        });
    }, [compositionRoot, onSchedulerRun]);

    useEffect(() => {
        getSchedulerInfo();
        const intervalId = setInterval(() => getSchedulerInfo(), 60 * 1000);
        return () => clearInterval(intervalId);
    }, [getSchedulerInfo, setStatus]);

    return (
        <SchedulerContainer>
            <b>{i18n.t("Scheduler")}</b>
            <FiberManualRecordIcon style={{ fill: status ? "green" : "red" }} />
        </SchedulerContainer>
    );
});

const SchedulerContainer = styled.div`
    display: inline-flex;
    float: right;
    align-items: center;
    margin: 10px;
    background-color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
    border: none;
    gap: 10px;
`;

function isRunning(info?: SchedulerExecution): boolean {
    return !!info?.nextExecution && info.nextExecution >= new Date();
}
