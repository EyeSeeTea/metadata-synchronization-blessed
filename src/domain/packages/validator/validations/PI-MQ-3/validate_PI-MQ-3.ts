import { ProgramIndicator } from "../../../../metadata/entities/MetadataEntities";
import { MetadataPackageToValidate } from "../../packageContentValidator";

const stopWords = ["PROPORTION", "PERCENTAGE"];
const properties: (keyof ProgramIndicator)[] = ["name", "shortName"];

// PI-MQ-3. Program Indicator contains the word 'proportion' or 'percentage'
export function validate_PI_MQ_3(packageContents: MetadataPackageToValidate): string[] {
    const programIndicators = (packageContents.programIndicators || []) as ProgramIndicator[];

    return properties
        .map(prop => {
            return programIndicators
                .filter(i => stopWords.some(word => i[prop].toString().toUpperCase().includes(word)))
                .map(
                    i =>
                        `PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (${i.id}) ${prop}='${i.name}'`
                );
        })
        .flat();
}
