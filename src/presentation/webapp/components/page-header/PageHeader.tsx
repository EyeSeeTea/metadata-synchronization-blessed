import { ButtonProps, Icon, IconButton, Tooltip } from "@material-ui/core";
import { Variant } from "@material-ui/core/styles/createTypography";
import Typography from "@material-ui/core/Typography";
import { DialogButton } from "d2-ui-components";
import React from "react";
import i18n from "../../../../locales";

const PageHeader: React.FC<PageHeaderProps> = ({
    variant = "h5",
    title,
    onBackClick,
    helpText,
    children,
}) => {
    return (
        <div>
            {!!onBackClick && (
                <IconButton
                    onClick={onBackClick}
                    color="secondary"
                    aria-label={i18n.t("Back")}
                    style={styles.backArrow}
                    data-test={"page-header-back"}
                >
                    <Icon color="primary">arrow_back</Icon>
                </IconButton>
            )}

            <Typography
                variant={variant}
                gutterBottom
                style={styles.text}
                data-test={"page-header-title"}
            >
                {title}
            </Typography>
            {helpText && renderHelpButton(helpText)}
            {children}
        </div>
    );
};

export interface PageHeaderProps {
    variant?: Variant;
    title: string;
    onBackClick?: () => void;
    helpText?: string;
}

const styles = {
    backArrow: { paddingTop: 10, marginBottom: 5 },
    help: { marginBottom: 8 },
    text: { display: "inline-block", fontWeight: 300 },
};

const Button = ({ onClick }: ButtonProps) => (
    <Tooltip title={i18n.t("Help")}>
        <IconButton onClick={onClick} style={styles.help}>
            <Icon color="primary">help</Icon>
        </IconButton>
    </Tooltip>
);

const renderHelpButton = (helpText: string) => (
    <DialogButton
        buttonComponent={Button}
        title={i18n.t("Help")}
        maxWidth={"sm"}
        fullWidth={true}
        contents={helpText}
    />
);

export default PageHeader;
