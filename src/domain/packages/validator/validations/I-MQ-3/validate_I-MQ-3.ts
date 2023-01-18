import { Indicator } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

const stopWords = ["PROPORTION", "PERCENTAGE"];
const properties: (keyof Indicator)[] = ["name", "shortName"];

// I-MQ-3. Indicator contains the word 'proportion' or 'percentage'
export function validate_I_MQ_3(packageContents: MetadataPackageToValidate): string[] {
    const indicators = (packageContents.indicators || []) as Indicator[];

    return properties
        .map(prop => {
            return indicators
                .filter(i => stopWords.some(word => i[prop].toString().toUpperCase().includes(word)))
                .map(
                    i =>
                        `PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (${i.id}) ${prop}='${i.name}'`
                );
        })
        .flat();
}
