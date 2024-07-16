import { FeedbackOptions } from "@eyeseetea/feedback-component";

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback: FeedbackOptions;
    encryptionKey: string;
}
