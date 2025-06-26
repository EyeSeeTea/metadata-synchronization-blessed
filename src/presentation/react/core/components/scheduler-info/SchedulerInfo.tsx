import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import React, { useEffect } from "react";
import styled from "styled-components";
import i18n from "../../../../../utils/i18n";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useSchedulerInfo } from "./useSchedulerInfo";

// NOTICE: This is refactored

export interface SchedulerInfoProps {
    onSchedulerRun?: (timestamp: string) => void;
}

export const SchedulerInfo: React.FC<SchedulerInfoProps> = React.memo(props => {
    const snackbar = useSnackbar();
    const { onSchedulerRun } = props;
    const { status, errorMessage } = useSchedulerInfo(onSchedulerRun);

    useEffect(() => {
        if (errorMessage) {
            snackbar.error(errorMessage);
        }
    }, [errorMessage, snackbar]);

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
