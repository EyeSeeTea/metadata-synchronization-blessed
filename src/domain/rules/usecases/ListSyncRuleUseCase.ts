import _ from "lodash";
import moment from "moment";
import { getD2APiFromInstance } from "../../../utils/d2-utils";
import { getUserInfo, isGlobalAdmin } from "../../../utils/permissions";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationType } from "../../synchronization/entities/SynchronizationType";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export interface ListSyncRuleUseCaseParams {
    paging?: boolean;
    pageSize?: number;
    page?: number;
    sorting?: { field: keyof SynchronizationRule; order: "asc" | "desc" };
    filters?: {
        targetInstanceFilter?: string;
        schedulerEnabledFilter?: string;
        lastExecutedFilter?: Date | null;
        types?: SynchronizationType[];
        search?: string;
        allProperties?: boolean;
    };
}

export interface ListSyncRuleUseCaseResult {
    rows: SynchronizationRule[];
    pager: { total: number; page: number; pageCount: number };
}

export class ListSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute({
        paging = true,
        pageSize = 25,
        page = 1,
        sorting = { field: "id", order: "asc" },
        filters = {},
    }: ListSyncRuleUseCaseParams): Promise<ListSyncRuleUseCaseResult> {
        const {
            targetInstanceFilter = null,
            schedulerEnabledFilter = null,
            lastExecutedFilter = null,
            types,
            search,
            allProperties = false,
        } = filters;

        const rawData = await this.repositoryFactory.rulesRepository(this.localInstance).list(allProperties);

        const filteredData = search
            ? _.filter(rawData, item =>
                  _(item.toObject())
                      .values()
                      .map(value => (typeof value === "string" ? value : undefined))
                      .compact()
                      .some(field => field.toLowerCase().includes(search.toLowerCase()))
              )
            : rawData;

        const { field, order } = sorting;
        const sortedData = _.orderBy(filteredData, [data => _.toLower(data[field] as string)], [order]);

        // TODO: FIXME Move this to config repository
        const globalAdmin = await isGlobalAdmin(getD2APiFromInstance(this.localInstance));
        const userInfo = await getUserInfo(getD2APiFromInstance(this.localInstance));

        const filteredObjects = _(sortedData)
            .filter(rule => {
                return _.isUndefined(types) || types.includes(rule.type);
            })
            .filter(rule => {
                return globalAdmin || rule.isVisibleToUser(userInfo);
            })
            .filter(rule => (targetInstanceFilter ? rule.targetInstances.includes(targetInstanceFilter) : true))
            .filter(rule => {
                if (!schedulerEnabledFilter) return true;
                return (
                    (rule.enabled && schedulerEnabledFilter === "enabled") ||
                    (!rule.enabled && schedulerEnabledFilter === "disabled")
                );
            })
            .filter(rule =>
                lastExecutedFilter && rule.lastExecuted
                    ? moment(lastExecutedFilter).isSameOrBefore(rule.lastExecuted, "date")
                    : true
            )
            .value();

        const total = filteredObjects.length;
        const pageCount = paging ? Math.ceil(filteredObjects.length / pageSize) : 1;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : total;
        const rows = _.slice(filteredObjects, firstItem, lastItem);

        return { rows, pager: { page, pageCount, total } };
    }
}
