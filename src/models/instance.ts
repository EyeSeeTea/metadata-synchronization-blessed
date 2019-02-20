import D2DataStore from "./d2DataStore";

export interface Data {
    name: string;
    url: string;
    username: string;
    password: string;
}

export default class Instance {
    constructor(private dataStore: D2DataStore, private data: Data) {
        // TODO: Encrypt password
    }

    public static create(dataStore: D2DataStore): Instance {
        const initialData = {
            name: "",
            url: "",
            username: "",
            password: ""
        };
        return new Instance(dataStore, initialData);
    }
}