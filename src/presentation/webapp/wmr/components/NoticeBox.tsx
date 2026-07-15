import { muiTheme } from "../../../react/core/themes/dhis2.theme";
import {
    Check as CheckIcon,
    ErrorOutline as ErrorOutlineIcon,
    InfoOutlined as InfoOutlinedIcon,
    WarningOutlined as WarningOutlinedIcon,
} from "@material-ui/icons";
import { Box, CircularProgress, Typography } from "@material-ui/core";

type NoticeBoxType = "loading" | "success" | "error" | "info" | "warning";

const colorByType: Record<NoticeBoxType, string> = {
    loading: muiTheme.palette.primary.main,
    info: muiTheme.palette.info.main,
    success: muiTheme.palette.success.main,
    error: muiTheme.palette.error.main,
    warning: muiTheme.palette.warning.main,
};

function IconByType({ status }: { status: NoticeBoxType }) {
    const DEFAULT_SIZE = 24;
    switch (status) {
        case "loading":
            return <CircularProgress size={DEFAULT_SIZE} />;
        case "success":
            return <CheckIcon height={DEFAULT_SIZE} width={DEFAULT_SIZE} htmlColor={colorByType[status]} />;
        case "error":
            return <ErrorOutlineIcon height={DEFAULT_SIZE} width={DEFAULT_SIZE} htmlColor={colorByType[status]} />;
        case "info":
            return <InfoOutlinedIcon height={DEFAULT_SIZE} width={DEFAULT_SIZE} htmlColor={colorByType[status]} />;
        case "warning":
            return <WarningOutlinedIcon height={DEFAULT_SIZE} width={DEFAULT_SIZE} htmlColor={colorByType[status]} />;
        default:
            return <InfoOutlinedIcon height={DEFAULT_SIZE} width={DEFAULT_SIZE} htmlColor={colorByType[status]} />;
    }
}

export type NoticeBoxProps = {
    type: NoticeBoxType;
    message?: string;
    children?: React.ReactNode;
};

// TODO: check if other component is preferred, or if we can promote it outside of WRM
export function NoticeBox({ type, message, children }: NoticeBoxProps) {
    return (
        <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            style={{ marginTop: "1rem", borderLeft: `4px solid ${colorByType[type]}` }}
        >
            <Box pl={2}>
                <IconByType status={type} />
            </Box>
            <Box flexDirection="column" display="flex" pl={2} flexGrow>
                {message ? <Typography>{message}</Typography> : null}
                {children}
            </Box>
        </Box>
    );
}
