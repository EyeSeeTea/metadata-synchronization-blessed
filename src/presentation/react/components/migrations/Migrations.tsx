import { ConfirmationDialog } from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import i18n from "../../../../locales";
import { MigrationsRunner } from "../../../../migrations";

export interface MigrationsProps {
    runner: MigrationsRunner;
    onFinish: () => void;
}

type State =
    | { type: "show-info" }
    | { type: "app-out-of-date" }
    | { type: "migrating" }
    | { type: "success" };

const Migrations: React.FC<MigrationsProps> = props => {
    const { runner, onFinish } = props;
    const [messages, setMessages] = useState<string[]>([]);
    const [state, setState] = useState<State>(getInitialState(runner));
    useEffect(followContents, [messages]);

    const debug = useCallback((message: string) => {
        setMessages(messages => [...messages, message]);
    }, []);

    const startMigration = useCallback(() => {
        runMigrations(runner, debug, setState).then(setState);
    }, [runner, debug]);

    const actionText = getActionText(state);

    if (state.type === "app-out-of-date") {
        return <MigrationsError runner={runner} onFinish={onFinish} />;
    }

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("There are pending migrations")}
            onSave={() => (state.type === "success" ? onFinish() : startMigration())}
            saveText={actionText}
            onCancel={undefined}
            disableSave={state.type === "migrating" || !actionText}
            maxWidth="md"
            fullWidth={true}
        >
            <div id="migrations-contents">
                <p>{getPendingMigrationsText(runner)}</p>

                <p>
                    {messages.map((msg, idx) => (
                        <React.Fragment key={idx}>
                            {msg}
                            <br />
                        </React.Fragment>
                    ))}
                </p>

                <p>
                    {state.type === "success" &&
                        i18n.t("Migrations finished successfully, you may now continue to the app")}
                </p>
            </div>
        </ConfirmationDialog>
    );
};

function runMigrations(
    runner: MigrationsRunner,
    debug: (message: string) => void,
    setState: React.Dispatch<React.SetStateAction<State>>
): Promise<State> {
    setState({ type: "migrating" });

    return runner
        .setDebug(debug)
        .execute()
        .then(() => ({ type: "success" as const }))
        .catch(() => {
            debug("---");
            debug(
                i18n.t(
                    "There has been an error. You can either retry or contact your administrator if you think there has been an un recoverable error"
                )
            );
            return { type: "show-info" as const };
        });
}

function followContents() {
    const contentsEl = document.getElementById("migrations-contents");
    const divEl = contentsEl ? contentsEl.parentElement : null;
    if (divEl) divEl.scrollTop = divEl.scrollHeight;
}

function getActionText(state: State): string | undefined {
    switch (state.type) {
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

function getInitialState(runner: MigrationsRunner): State {
    if (runner.instanceVersion === runner.appVersion) {
        return { type: "success" };
    } else if (runner.instanceVersion > runner.appVersion) {
        return { type: "app-out-of-date" };
    } else {
        return { type: "show-info" };
    }
}

function getPendingMigrationsText(runner: MigrationsRunner): string {
    return i18n.t(
        "The app needs to run all pending migrations (v{{instanceVersion}} -> v{{appVersion}}) in order to continue. This may take a long time, make sure the process is not interrupted.",
        runner
    );
}

const isDebug = process.env.NODE_ENV === "development";

const MigrationsError: React.FC<{ runner: MigrationsRunner; onFinish: () => void }> = ({
    runner,
    onFinish,
}) => (
    <ConfirmationDialog
        isOpen={true}
        title={i18n.t("Error")}
        onSave={isDebug ? onFinish : undefined}
        saveText={i18n.t("Continue to app anyway")}
        maxWidth="md"
        fullWidth={true}
    >
        {i18n.t(
            "The database version (v{{instanceVersion}}) is greater than the app version (v{{appVersion}}), we cannot continue. Please contact the administrator to update the app.",
            runner
        )}
    </ConfirmationDialog>
);

export default Migrations;
