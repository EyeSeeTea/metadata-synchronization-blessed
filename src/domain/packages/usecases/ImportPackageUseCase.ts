import { debug } from "../../../utils/debug";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { DataSource } from "../../instance/entities/DataSource";
import { Instance } from "../../instance/entities/Instance";
import { JSONDataSource } from "../../instance/entities/JSONDataSource";
import { MetadataMappingDictionary } from "../../mapping/entities/MetadataMapping";
import { MappingMapper } from "../../mapping/helpers/MappingMapper";
import {
    MetadataRepository,
    MetadataRepositoryConstructor,
} from "../../metadata/repositories/MetadataRepository";
import { Repositories } from "../../Repositories";
import { SynchronizationResult } from "../../synchronization/entities/SynchronizationResult";
import { TransformationRepositoryConstructor } from "../../transformations/repositories/TransformationRepository";
import { Package } from "../entities/Package";

export class ImportPackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        item: Package,
        mapping: MetadataMappingDictionary = {},
        destinationInstance?: DataSource
    ): Promise<SynchronizationResult> {
        const originInstance = JSONDataSource.build(item.dhisVersion, item.contents);

        const originCategoryOptionCombos = await this.getMetadataRepository(
            originInstance
        ).getCategoryOptionCombos();
        const destinationCategoryOptionCombos = await this.getMetadataRepository(
            destinationInstance
        ).getCategoryOptionCombos();

        const mapper = new MappingMapper(
            mapping,
            originCategoryOptionCombos,
            destinationCategoryOptionCombos
        );

        const payload = mapper.applyMapping(item.contents);
        const result = await this.getMetadataRepository(destinationInstance).save(payload);

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

    protected getMetadataRepository(
        remoteInstance: DataSource = this.localInstance
    ): MetadataRepository {
        const transformationRepository = this.repositoryFactory.get<
            TransformationRepositoryConstructor
        >(Repositories.TransformationRepository, []);

        const tag = remoteInstance.type === "json" ? "json" : undefined;

        return this.repositoryFactory.get<MetadataRepositoryConstructor>(
            Repositories.MetadataRepository,
            [remoteInstance, transformationRepository],
            tag
        );
    }
}
