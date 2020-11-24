import { debug } from "../../../utils/debug";
import { DefaultUseCase, UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { Package } from "../entities/Package";

export class ImportPackageUseCase extends DefaultUseCase implements UseCase {
    constructor(repositoryFactory: RepositoryFactory, private localInstance: Instance) {
        super(repositoryFactory);
    }

    public async execute(
        item: Package,
        mapping: MetadataMappingDictionary = {},
        originInstance: DataSource,
        destinationInstance: DataSource = this.localInstance
    ): Promise<SynchronizationResult> {
        const originCategoryOptionCombos = await this.metadataRepository(
            originInstance
        ).getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await this.metadataRepository(
            destinationInstance
        ).getCategoryOptionCombos();

        const mapper = new MappingMapper(
            mapping,
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        const payload = mapper.applyMapping(item.contents);
        const result = await this.metadataRepository(destinationInstance).save(payload);

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
