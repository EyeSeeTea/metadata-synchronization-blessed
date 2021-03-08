import { Instance } from "../../instance/entities/Instance";
import { User } from "../entities/User";

export interface UserRepositoryConstructor {
    new (instance: Instance): UserRepository;
}

export interface UserRepository {
    getCurrent(): Promise<User>;
}
