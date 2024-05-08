import { AppConfig } from "./app-config.template";

export const appConfig: AppConfig = {
    appKey: "metadata-synchronization",
    appearance: {
        showShareButton: false,
    },
    feedback: {
        repositories: {
            clickUp: {
                listId: "44406062",
                title: "[User feedback] {title}",
                body: "## dhis2\n\nUsername: {username}\n\n{body}",
            },
        },
        layoutOptions: {
            showContact: false,
            descriptionTemplate: "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n",
        },
    },
};
