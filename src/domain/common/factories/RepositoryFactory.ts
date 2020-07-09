import { cache } from "../../../utils/cache";

type ClassType = new (...args: any[]) => any;

export class RepositoryFactory {
    private repositories: Map<string, ClassType> = new Map();

    public bind(repository: string, implementation: ClassType, tag = "default") {
        this.repositories.set(`${repository}-${tag}`, implementation);
    }

    @cache()
    public get<Constructor extends ClassType, Key extends string = string>(
        repository: string,
        params: ConstructorParameters<Constructor>,
        tag?: Key
    ): InstanceType<Constructor> {
        const repositoryName = `${repository}-${tag ?? "default"}`;
        const Implementation = this.repositories.get(repositoryName);
        if (!Implementation) throw new Error(`Repository ${repositoryName} not found`);
        return new Implementation(...params);
    }
}
