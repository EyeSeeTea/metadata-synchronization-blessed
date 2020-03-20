export type Identifiable = { id: string };

export interface Config {
    version: number;
    migration?: { version: number; error?: string };
}
