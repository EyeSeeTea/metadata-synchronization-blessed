import { NamedRef } from "../../common/entities/Ref";
import { Package } from "../../packages/entities/Package";
import { ImportedPackage } from "../entities/ImportedPackage";
import { isInstance, PackageSource } from "../entities/PackageSource";

export function mapToImportedPackage(
    originPackage: Package,
    author: NamedRef,
    packageSource: PackageSource,
    url?: string
): ImportedPackage {
    return ImportedPackage.create({
        type: isInstance(packageSource) ? "INSTANCE" : "STORE",
        remoteId: packageSource.id,
        url,
        module: { id: originPackage.module.id, name: originPackage.module.name },
        package: { id: originPackage.id, name: originPackage.name },
        version: originPackage.version,
        dhisVersion: originPackage.dhisVersion,
        author,
        contents: originPackage.contents,
    });
}
