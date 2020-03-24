import React from "react";
import i18n from "../../locales";
import { ConfirmationDialog } from "d2-ui-components";
import { MigrationsRunner } from "../../migrations";

interface MigrationsProps {
    runner: MigrationsRunner;
    onFinish: () => void;
}

type State = { type: "show-info" } | { type: "migrating" } | { type: "success" };

const Migrations: React.FC<MigrationsProps> = props => {
    const { runner, onFinish } = props;
    const [messages, setMessages] = React.useState<string[]>([]);
    const [state, setState] = React.useState<State>({ type: "show-info" });

    React.useEffect(followContents, [messages]);

    const debug = React.useCallback((message: string) => {
        setMessages(messages => [...messages, message]);
    }, []);

    const startMigration = React.useCallback(() => {
        runMigrations(runner, debug, setState).then(setState);
    }, [runner, debug]);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("There are pending migrations")}
            onSave={() => (state.type === "success" ? onFinish() : startMigration())}
            saveText={getActionText(state)}
            onCancel={undefined}
            disableSave={state.type === "migrating"}
            maxWidth="md"
            fullWidth={true}
        >
            <div id="migrations-contents">
                <p>
                    {i18n.t(
                        "The app needs to run all pending migrations (v{{instanceVersion}} -> v{{appVersion}}) in order to continue. This may take a long time, make sure the process is not interrupted.",
                        runner
                    )}
                </p>

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
                "There has been an error. You can either retry or contact your administrator if you think there has been an un recoverable error"
            );
            return { type: "show-info" as const };
        });
}

function followContents() {
    const contentsEl = document.getElementById("migrations-contents");
    const divEl = contentsEl ? contentsEl.parentElement : null;
    if (divEl) divEl.scrollTop = divEl.scrollHeight;
}

function getActionText(state: State): string {
    switch (state.type) {
        case "show-info":
            return i18n.t("Migrate instance");
        case "migrating":
            return i18n.t("Migrating...");
        case "success":
            return i18n.t("Continue to the App");
    }
}

export default Migrations;
