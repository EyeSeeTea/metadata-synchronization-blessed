
export interface InstanceData {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string;
    description?: string;
    version?: string
}

export default class Instance {
    private data: InstanceData;

    constructor(data: InstanceData) {
        this.data = data;
    }

    public get id(): string {
        return this.data.id;
    }

    public get name(): string {
        return this.data.name;
    }

    public get url(): string {
        return this.data.url;
    }

    public get username(): string {
        return this.data.username;
    }

    public get password(): string {
        return this.data.password;
    }

    public get description(): string {
        return this.data.description ?? "";
    }

    public get version(): string | undefined {
        return this.data.version;
    }

    public get apiVersion(): number | undefined {
        return this.version ? +this.version?.split(".")[1] : undefined
    }
}