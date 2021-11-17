import axios from "axios";
import _ from "lodash";
import moment, { Moment } from "moment";
import { D2Api } from "../types/d2-api";

interface TableList {
    objects: any[];
    pager: {
        total: number;
        page: number;
        pageCount?: number;
    };
}

interface TableFilters {
    search?: string;
    fields?: string[];
    lastUpdatedDate?: Moment;
    groupFilter?: string;
    customFilters?: string[];
    customFields?: string[];
    metadataType?: string;
}

interface TablePagination {
    page?: number;
    pageSize?: number;
    sorting?: string[];
    paging?: boolean;
}

type DeletedObjectData = {
    uid: string;
    code: string;
    klass: string;
    deletedAt: Date;
    deletedBy: string;
};

/**
 * @deprecated This class should not be used for future developments
 */
export default class DeletedObject {
    private data: DeletedObjectData;

    constructor(data: DeletedObjectData) {
        this.data = data;
    }

    public get code(): string {
        return this.data.code;
    }

    public get klass(): string {
        return this.data.klass;
    }

    public get deletedAt(): Date {
        return this.data.deletedAt;
    }

    public get deletedBy(): string {
        return this.data.deletedBy;
    }

    public static build(data: DeletedObjectData | undefined): DeletedObject {
        return new DeletedObject(
            data || {
                uid: "",
                code: "",
                klass: "",
                deletedAt: new Date(),
                deletedBy: "",
            }
        );
    }

    public static async list(api: D2Api, filters: TableFilters, pagination: TablePagination): Promise<TableList> {
        const { search = null, lastUpdatedDate = null } = filters || {};
        const { page = 1, pageSize = 20, paging = true, sorting = ["id", "asc"] } = pagination || {};

        const { deletedObjects: rawData } = (
            await axios.get<any>(api.apiPath + "/deletedObjects", {
                withCredentials: true,
                params: {
                    fields: ":all,uid~rename(id)",
                    paging: false,
                },
            })
        ).data;

        const filteredData = _(rawData)
            .filter(object =>
                search
                    ? _(object)
                          .keys()
                          .filter(k => typeof object[k] === "string")
                          .some(k => object[k].toLowerCase().includes(search.toLowerCase()))
                    : true
            )
            .filter(object =>
                lastUpdatedDate && object.deletedAt ? moment(lastUpdatedDate).isSameOrBefore(object.deletedAt) : true
            )
            .value();

        const [field, direction] = sorting;
        const sortedData = _.orderBy(
            filteredData,
            [data => (data[field] ? data[field].toLowerCase() : "")],
            [direction as "asc" | "desc"]
        );

        const total = sortedData.length;
        const pageCount = paging ? Math.ceil(sortedData.length / pageSize) : 1;
        const firstItem = paging ? (page - 1) * pageSize : 0;
        const lastItem = paging ? firstItem + pageSize : sortedData.length;
        const paginatedData = _.slice(sortedData, firstItem, lastItem);

        return { objects: paginatedData, pager: { page, pageCount, total } };
    }
}
