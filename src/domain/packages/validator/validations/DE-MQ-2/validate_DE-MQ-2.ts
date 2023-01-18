import { DataElement } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

const numberOf = "NUMBER OF";

// DE-MQ-2. DataElement contains the words 'number of'
export function validate_DE_MQ_2(packageContents: MetadataPackageToValidate): string[] {
    const dataElements = (packageContents.dataElements || []) as DataElement[];

    const nameErrors = dataElements
        .filter(de => de.name.toUpperCase().includes(numberOf))
        .map(de => `DE-MQ-2 - DataElement contains the words 'number of' (${de.id}) name='${de.name}'`);

    const shortNameErrors = dataElements
        .filter(de => de.shortName.toUpperCase().includes(numberOf))
        .map(de => `DE-MQ-2 - DataElement contains the words 'number of' (${de.id}) shortName='${de.shortName}'`);

    return [...nameErrors, ...shortNameErrors];
}
