import { makeStyles, Theme, Typography } from "@material-ui/core";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { Log } from "../../../../../domain/migrations/entities/Debug";
import { MigrationVersions } from "../../../../../domain/migrations/entities/MigrationVersions";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import { UseMigrationsResult } from "./hooks";

export interface MigrationsProps {
    migrations: UseMigrationsResult;
}

export interface MigrationsRunnerProps {
    onFinish: () => void;
}

const Migrations: React.FC<MigrationsProps> = props => {
    const { state, onFinish } = props.migrations;

    if (state.type === "checking" || state.type === "checked") {
        return null;
    } else {
        return <MigrationsDialog onFinish={onFinish} />;
    }
};

interface DialogState {
    type: "show-info" | "app-out-of-date" | "migrating" | "success" | "initializing";
}

const MigrationsDialog: React.FC<MigrationsRunnerProps> = ({ onFinish }) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();

    const [state, setState] = useState<DialogState>({ type: "initializing" });
    const [messages, setMessages] = useState<Log[]>([]);
    const [versions, setVersions] = useState<MigrationVersions>();

    useEffect(() => {
        compositionRoot.migrations.getVersions().then(versions => {
            const { appVersion, instanceVersion } = versions;
            setVersions(versions);

            if (instanceVersion === appVersion) {
                setState({ type: "success" });
            } else if (instanceVersion > appVersion) {
                setState({ type: "app-out-of-date" });
            } else {
                setState({ type: "show-info" });
            }
        });
    }, [compositionRoot]);

    useEffect(followContents, [messages]);

    const debug = useCallback((message: Log) => {
        setMessages(messages => [...messages, message]);
    }, []);

    const startMigration = useCallback(async () => {
        try {
            setState({ type: "migrating" });
            await compositionRoot.migrations.run(debug);
            setState({ type: "success" });
        } catch (err: any) {
            debug({ message: "---" });
            debug({ message: `Error: ${err.message}` });
            debug({
                message: i18n.t(
                    "There has been an error. You can either retry or contact your administrator if you think there has been an un recoverable error"
                ),
            });
            setState({ type: "show-info" });
        }
    }, [compositionRoot, debug]);

    const actionText = getActionText(state);

    if (!versions) {
        return null;
    }

    if (state.type === "app-out-of-date") {
        return <MigrationsError versions={versions} onFinish={onFinish} />;
    }

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("There are pending migrations")}
            onSave={() => (state.type === "success" ? onFinish() : startMigration())}
            saveText={actionText}
            onCancel={isDebug ? onFinish : undefined}
            cancelText={i18n.t("Ignore")}
            disableSave={state.type === "migrating" || !actionText}
            maxWidth="md"
            fullWidth={true}
        >
            <div id="migrations-contents">
                <p>{getPendingMigrationsText(versions)}</p>

                <p>
                    {messages.map((msg, idx) => {
                        switch (msg.level) {
                            case "warning":
                                return (
                                    <Typography key={idx} className={classes.warning}>
                                        {msg.message}
                                    </Typography>
                                );
                            default:
                                return <Typography key={idx}>{msg.message}</Typography>;
                        }
                    })}
                </p>

                <p>
                    {state.type === "success" &&
                        i18n.t("Migrations finished successfully, you may now continue to the app")}
                </p>
            </div>
        </ConfirmationDialog>
    );
};

function followContents() {
    const contentsEl = document.getElementById("migrations-contents");
    const divEl = contentsEl ? contentsEl.parentElement : null;
    if (divEl) divEl.scrollTop = divEl.scrollHeight;
}

function getActionText(state: DialogState): string | undefined {
    switch (state.type) {
        case "initializing":
            return i18n.t("Checking migrations");
        case "show-info":
            return i18n.t("Migrate instance");
        case "migrating":
            return i18n.t("Migrating...");
        case "success":
            return i18n.t("Continue to the App");
        case "app-out-of-date":
            return;
    }
}

function getPendingMigrationsText(versions: MigrationVersions): string {
    return i18n.t(
        "The app needs to run pending migrations (from version {{instanceVersion}} to version {{appVersion}}) in order to continue. This may take a long time, make sure the process is not interrupted.",
        versions
    );
}

const isDebug = process.env.NODE_ENV === "development";

const MigrationsError: React.FC<{ versions: MigrationVersions; onFinish: () => void }> = ({ versions, onFinish }) => (
    <ConfirmationDialog
        isOpen={true}
        title={i18n.t("Error")}
        onSave={isDebug ? onFinish : undefined}
        saveText={i18n.t("Continue to the app anyway")}
        maxWidth="md"
        fullWidth={true}
    >
        {i18n.t(
            "The database version ({{instanceVersion}}) is greater than the app version ({{appVersion}}), cannot continue. Please contact the administrator to update the app.",
            versions
        )}
    </ConfirmationDialog>
);

export default Migrations;

const useStyles = makeStyles((theme: Theme) => ({
    warning: {
        color: theme.palette.warning.main,
        fontWeight: "bold",
    },
}));
