import { FeedbackOptions } from "@eyeseetea/feedback-component";

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    app: {
        notifyEmailOnProjectSave: string[];
    };
    feedback: FeedbackOptions;
}
