import { FutureData } from "../../../common/entities/Future";
import { Instance } from "../../../instance/entities/Instance";
import { WmrRequisiteType } from "../entities/WmrRequisite";

export interface WmrRequisitesRepositoryConstructor {
    new (instance: Instance): WmrRequisitesRepository;
}

export interface WmrRequisitesRepository {
    checkWmrRequisites(requisiteType: WmrRequisiteType): FutureData<boolean>;
    setupRequisite(requisiteType: WmrRequisiteType): FutureData<void>;
    validateOrgUnit(orgUnitId: string): FutureData<boolean>;
}
