import { Button, makeStyles } from "@material-ui/core";
import React from "react";
import { SynchronizationRule } from "../../../../domain/rules/entities/SynchronizationRule";

export interface SyncRuleButtonProps {
    rule: SynchronizationRule;
    onClick(rule: SynchronizationRule): void;
    disabled: boolean;
}

export const SyncRuleButton: React.FC<SyncRuleButtonProps> = React.memo(props => {
    const { rule, onClick, disabled } = props;
    const classes = useStyles();

    const notifyClick = React.useCallback(() => {
        onClick(rule);
    }, [onClick, rule]);

    return (
        <Button
            onClick={notifyClick}
            variant="contained"
            color="primary"
            className={classes.runButton}
            disabled={disabled}
        >
            {rule.name}
        </Button>
    );
});

export const useStyles = makeStyles(() => ({
    runButton: {
        margin: "0 auto",
    },
}));
