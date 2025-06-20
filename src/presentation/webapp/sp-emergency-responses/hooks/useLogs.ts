import React from "react";

export type Message = React.ReactNode;

export interface Logs {
    messages: Message[];
    log(msg: Message): void;
    clear(): void;
}

export function useLogs(): Logs {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const log = React.useCallback((msg: Message) => setMessages(msgs => [...msgs, msg]), []);
    const clear = React.useCallback(() => setMessages([]), []);
    return { messages, log, clear };
}
