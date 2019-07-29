import _ from "lodash";
import axios from "axios";

import { D2 } from "../types/d2";
import { TableList, TablePagination, TableFilters } from "../types/d2-ui-components";

type DeletedObjectData = {
    uid: string;
    code: string;
    klass: string;
    deletedAt: Date;
    deletedBy: string;
};

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

    public static build(data: any | undefined): DeletedObject {
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

    public static async list(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { search = null } = filters || {};
        const { page = 1, pageSize = 20, paging = true, sorting = ["id", "asc"] } =
            pagination || {};

        const { deletedObjects: rawData } = (await axios.get(
            d2.Api.getApi().baseUrl + "/deletedObjects",
            {
                withCredentials: true,
                params: {
                    fields: ":all,uid~rename(id)",
                    paging: false,
                },
            }
        )).data;

        const filteredData = search
            ? _.filter(rawData, o =>
                  _(o)
                      .keys()
                      .filter(k => typeof o[k] === "string")
                      .some(k => o[k].toLowerCase().includes(search.toLowerCase()))
              )
            : rawData;

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
