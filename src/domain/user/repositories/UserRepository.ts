import { User } from "../entities/User";

export interface UserRepository {
    getCurrent(): Promise<User>;
}
