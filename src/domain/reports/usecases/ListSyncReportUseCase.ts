import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationType } from "../../synchronization/entities/SynchronizationType";
import { SynchronizationReport } from "../entities/SynchronizationReport";

export interface ListSyncReportUseCaseParams {
    paging?: boolean;
    pageSize?: number;
    page?: number;
    sorting?: { field: keyof SynchronizationReport; order: "asc" | "desc" };
    filters?: {
        statusFilter?: string;
        syncRuleFilter?: string;
        types?: SynchronizationType[];
        search?: string;
    };
}

export interface ListSyncReportUseCaseResult {
    rows: SynchronizationReport[];
    pager: { total: number; page: number; pageSize: number; sorting: string[]; paging: boolean };
}

export class ListSyncReportUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute({
        paging = true,
        pageSize = 25,
        page = 1,
        sorting = { field: "id", order: "asc" },
        filters = {},
    }: ListSyncReportUseCaseParams): Promise<ListSyncReportUseCaseResult> {
        const rawData = await this.repositoryFactory.reportsRepository(this.localInstance).list();

        const { statusFilter, syncRuleFilter, types, search } = filters;

        const filteredData = search
            ? _.filter(rawData, item =>
                  _(item)
                      .values()
                      .map(value => (typeof value === "string" ? value : undefined))
                      .compact()
                      .some(field => field.toLowerCase().includes(search.toLowerCase()))
              )
            : rawData;

        const { field, order } = sorting;
        const sortedData = _.orderBy(filteredData, [data => _.toLower(data[field] as string)], [order]);

        const filteredObjects = _(sortedData)
            .filter(e => (statusFilter ? e.status === statusFilter : true))
            .filter(e => (syncRuleFilter ? e.syncRule === syncRuleFilter : true))
            .filter(({ type: elementType = "metadata" }) => (types ? types.includes(elementType) : true))
            .value();

        const total = filteredObjects.length;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : total;
        const rows = _.slice(filteredObjects, firstItem, lastItem);

        return { rows, pager: { page, pageSize, total, sorting: [field, order], paging } };
    }
}
