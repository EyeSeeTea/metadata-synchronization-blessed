import { Id } from "../../../common/entities/Schemas";
import { Instance } from "../../../instance/entities/Instance";
import { WmrDataSet } from "../entities/WmrDataSet";

export interface WmrDataSetRepositoryConstructor {
    new (instance: Instance): WmrDataSetRepository;
}

export interface WmrDataSetRepository {
    getById(id: Id): Promise<WmrDataSet>;
}
