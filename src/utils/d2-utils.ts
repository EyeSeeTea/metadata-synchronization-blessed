import _ from "lodash";
import { D2Api } from "../types/d2-api";
import { Instance } from "../domain/instance/entities/Instance";
import { Id } from "../domain/common/entities/Schemas";
import { DataElement, DataSet, Program } from "../domain/metadata/entities/MetadataEntities";
import { cache } from "./cache";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: Instance) {
    /*
    Problem: If we use Axios (XMLHttpRequest.withCredentials option), the session is lost when
    connecting to an instance in the same domain (even with a different path prefix or port).

    Solution: Use fetch API (now supported by d2-api), so it sends credentials=omit when auth is passed.

    Documentation:

    https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
    */
    return new D2Api({ baseUrl: instance.url, auth: instance.auth, backend: "fetch" });
}

export class D2MetadataUtils {
    static async excludeDefaults(metadata: GenericMetadata, defaultIds: Id[]) {
        // In DHIS 2.38.5 and above the defaults parameter is not working
        // /api/metadata.json?fields=id,categoryCombo&filter=id:eq:data_element_id&defaults=INCLUDE/EXCLUDE; this is not working
        // so manually removing the default categoryCombo
        const result = _(metadata)
            .mapValues(elements => {
                return elements.map(element => this.excludeDefaultsFromModels(element, defaultIds));
            })
            .value();
        return result;
    }

    @cache()
    static async getDefaultIds(api: D2Api, filter?: string): Promise<string[]> {
        const response = (await api
            .get("/metadata", {
                filter: "identifiable:eq:default",
                fields: "id",
            })
            .getData()) as {
            [key: string]: { id: string }[];
        };

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    }

    private static excludeDefaultsFromModels(fixedElement: MetadataDefaultCategoryCombo, defaultIds: Id[]) {
        return fixedElement.categoryCombo && defaultIds.includes(fixedElement.categoryCombo.id)
            ? _(fixedElement).omit("categoryCombo").value()
            : fixedElement;
    }
}

type GenericMetadata = { dataElements: DataElement[]; dataSets: DataSet[]; programs: Program[] };
type MetadataDefaultCategoryCombo = DataElement | DataSet | Program;
