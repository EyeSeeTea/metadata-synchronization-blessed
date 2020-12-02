import { debug } from "../../../utils/debug";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import { SynchronizationResult } from "../../reports/entities/SynchronizationResult";
import { Package } from "../entities/Package";

export class ImportPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        item: Package,
        mapping: MetadataMappingDictionary = {},
        originInstance: DataSource,
        destinationInstance: DataSource = this.localInstance
    ): Promise<SynchronizationResult> {
        const originCategoryOptionCombos = await this.repositoryFactory
            .metadataRepository(originInstance)
            .getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await this.repositoryFactory
            .metadataRepository(destinationInstance)
            .getCategoryOptionCombos();

        const mapper = new MappingMapper(
            mapping,
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        const payload = mapper.applyMapping(item.contents);
        const result = await this.repositoryFactory
            .metadataRepository(destinationInstance)
            .save(payload);

        debug("Import package", {
            originInstance,
            originCategoryOptionCombos,
            destinationCategoryOptionCombos,
            mapping,
            payload,
            result,
        });

        return result;
    }
}
