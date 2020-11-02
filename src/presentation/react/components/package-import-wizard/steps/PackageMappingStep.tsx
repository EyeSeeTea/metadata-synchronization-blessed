import { useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { DataSource } from "../../../../../domain/instance/entities/DataSource";
import { JSONDataSource } from "../../../../../domain/instance/entities/JSONDataSource";
import { DataSourceMapping } from "../../../../../domain/mapping/entities/DataSourceMapping";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../../../../../domain/mapping/entities/MetadataMapping";
import {
    isInstance,
    PackageSource,
} from "../../../../../domain/package-import/entities/PackageSource";
import { ListPackage } from "../../../../../domain/packages/entities/Package";
import i18n from "../../../../../locales";
import {
    AggregatedDataElementModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    IndicatorMappedModel,
    OrganisationUnitMappedModel,
} from "../../../../../models/dhis/mapping";
import { isGlobalAdmin } from "../../../../../utils/permissions";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import MappingTable from "../../mapping-table/MappingTable";
import { PackageImportWizardProps } from "../PackageImportWizard";

const models = [
    AggregatedDataElementModel,
    IndicatorMappedModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    OrganisationUnitMappedModel,
];

export const PackageMappingStep: React.FC<PackageImportWizardProps> = ({ packageImportRule }) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [packages, setPackages] = useState<ListPackage[]>([]);
    const [instance, setInstance] = useState<DataSource>();

    const [packageFilter, setPackageFilter] = useState<string>(packageImportRule.packageIds[0]);
    const [dataSourceMapping, setDataSourceMapping] = useState<DataSourceMapping>();

    const onChangeMapping = useCallback(
        async (metadataMapping: MetadataMappingDictionary) => {
            if (!dataSourceMapping) {
                snackbar.error(i18n.t("Attempting to update mapping without a valid data source"));
                return;
            }

            const newMapping = dataSourceMapping.updateMappingDictionary(metadataMapping);

            const result = await compositionRoot.mapping.save(newMapping);
            result.match({
                error: () => {
                    snackbar.error(i18n.t("Could not save mapping"));
                },
                success: () => {
                    setDataSourceMapping(newMapping);
                },
            });
        },
        [compositionRoot, dataSourceMapping, snackbar]
    );

    const onApplyGlobalMapping = useCallback(
        async (type: string, id: string, subMapping: MetadataMapping) => {
            if (!dataSourceMapping) return;
            const newMapping = _.clone(dataSourceMapping.mappingDictionary);
            _.set(newMapping, [type, id], { ...subMapping, global: true });
            await onChangeMapping(newMapping);
        },
        [dataSourceMapping, onChangeMapping]
    );

    const packageFilterComponent = (
        <Dropdown
            key="filter-package"
            items={packages}
            onValueChange={setPackageFilter}
            value={packageFilter}
            label={i18n.t("Package")}
            hideEmpty={true}
        />
    );

    const updateDataSource = useCallback(
        async (source: PackageSource, packageId: string) => {
            if (isInstance(source)) {
                const mapping = await compositionRoot.mapping.get({
                    type: "instance",
                    id: source.id,
                });

                setDataSourceMapping(mapping);
                setInstance(source);
            } else {
                const result = await compositionRoot.packages.getStore(source.id, packageId);

                await result.match({
                    error: async () => {
                        snackbar.error(i18n.t("Unknown error happened loading store"));
                    },
                    success: async ({ dhisVersion, contents, module }) => {
                        const owner = {
                            type: "store" as const,
                            id: source.id,
                            moduleId: module.id,
                        };

                        const mapping = await compositionRoot.mapping.get(owner);
                        const defaultMapping = DataSourceMapping.build({
                            owner,
                            mappingDictionary: {},
                        });

                        setDataSourceMapping(mapping ?? defaultMapping);
                        setInstance(JSONDataSource.build(dhisVersion, contents));
                    },
                });
            }
        },
        [compositionRoot, snackbar]
    );

    useEffect(() => {
        updateDataSource(packageImportRule.source, packageFilter);
    }, [updateDataSource, packageFilter, packageImportRule.source]);

    useEffect(() => {
        isGlobalAdmin(api).then(setGlobalAdmin);
    }, [api]);

    useEffect(() => {
        if (isInstance(packageImportRule.source)) {
            compositionRoot.packages
                .list(globalAdmin, packageImportRule.source)
                .then(packages => {
                    const importPackages = packages.filter(pkg =>
                        packageImportRule.packageIds.includes(pkg.id)
                    );

                    setPackages(importPackages);
                })
                .catch((error: Error) => {
                    snackbar.error(error.message);
                    setPackages([]);
                });
        } else {
            compositionRoot.packages.listStore(packageImportRule.source.id).then(result => {
                result.match({
                    success: packages => {
                        const importPackages = packages.filter(pkg =>
                            packageImportRule.packageIds.includes(pkg.id)
                        );

                        setPackages(importPackages);
                    },
                    error: error => {
                        snackbar.error(error);
                        setPackages([]);
                    },
                });
            });
        }
    }, [compositionRoot, packageImportRule, globalAdmin, snackbar]);

    if (!dataSourceMapping || !instance) return null;

    return (
        <MappingTable
            models={models}
            originInstance={instance}
            destinationInstance={compositionRoot.localInstance}
            mapping={dataSourceMapping.mappingDictionary}
            globalMapping={dataSourceMapping.mappingDictionary}
            onChangeMapping={onChangeMapping}
            onApplyGlobalMapping={onApplyGlobalMapping}
            externalFilterComponents={packageFilterComponent}
            viewFilters={["onlySelected"]}
            showResponsible={false}
        />
    );
};
