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
    MetadataEntities,
    MetadataPackage,
} from "../../../../../domain/metadata/entities/MetadataEntities";
import {
    isInstance,
    PackageSource,
} from "../../../../../domain/package-import/entities/PackageSource";
import { ListPackage } from "../../../../../domain/packages/entities/Package";
import i18n from "../../../../../locales";
import {
    AggregatedDataElementModel,
    GlobalCategoryComboModel,
    GlobalCategoryModel,
    GlobalCategoryOptionGroupModel,
    GlobalCategoryOptionGroupSetModel,
    GlobalCategoryOptionModel,
    GlobalOptionModel,
    IndicatorMappedModel,
    OrganisationUnitMappedModel,
} from "../../../../../models/dhis/mapping";
import { isGlobalAdmin } from "../../../../../utils/permissions";
import { useAppContext } from "../../../contexts/AppContext";
import Dropdown from "../../dropdown/Dropdown";
import MappingTable from "../../mapping-table/MappingTable";
import { PackageImportWizardProps } from "../PackageImportWizard";
import Alert from "@material-ui/lab/Alert/Alert";
import { makeStyles, Theme } from "@material-ui/core";

const models = [
    GlobalCategoryModel,
    GlobalCategoryComboModel,
    GlobalCategoryOptionModel,
    GlobalCategoryOptionGroupModel,
    GlobalCategoryOptionGroupSetModel,
    AggregatedDataElementModel,
    GlobalOptionModel,
    IndicatorMappedModel,
    OrganisationUnitMappedModel,
];

export const PackageMappingStep: React.FC<PackageImportWizardProps> = ({
    packageImportRule,
    onChange,
}) => {
    const classes = useStyles();
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [packages, setPackages] = useState<ListPackage[]>([]);
    const [instance, setInstance] = useState<DataSource>();

    const [packageFilter, setPackageFilter] = useState<string>(packageImportRule.packageIds[0]);
    const [dataSourceMapping, setDataSourceMapping] = useState<DataSourceMapping>();
    const [packageContents, setPackageContents] = useState<MetadataPackage>();
    const [mappingMessage, setMappingMessage] = useState("");

    const onChangeMapping = useCallback(
        async (metadataMapping: MetadataMappingDictionary) => {
            if (!dataSourceMapping) {
                snackbar.error(i18n.t("Attempting to update mapping without a valid data source"));
                return;
            }

            const newMapping = dataSourceMapping.updateMappingDictionary(metadataMapping);

            if (newMapping.owner.type !== "package") {
                const result = await compositionRoot.mapping.save(newMapping);
                result.match({
                    error: () => {
                        snackbar.error(i18n.t("Could not save mapping"));
                    },
                    success: () => {
                        setDataSourceMapping(newMapping);
                    },
                });
            } else {
                onChange(packageImportRule.addOrUpdateTemporalPackageMapping(newMapping));
            }
        },
        [compositionRoot, dataSourceMapping, snackbar, packageImportRule, onChange]
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

                const packageResult = await compositionRoot.packages.get(packageId, source);

                await packageResult.match({
                    error: async () => {
                        snackbar.error(i18n.t("Unknown error happened loading package"));
                    },
                    success: async ({ dhisVersion, module, contents }) => {
                        setPackageContents(contents);

                        const fullModule = await compositionRoot.modules.get(module.id, source);

                        if (fullModule) {
                            if (fullModule.autogenerated) {
                                const savedTemporalMapping = packageImportRule.temporalPackageMappings.find(
                                    mappingTemp => mappingTemp.owner.id === packageId
                                );

                                const temporalMapping = savedTemporalMapping
                                    ? savedTemporalMapping
                                    : DataSourceMapping.build({
                                          owner: { type: "package" as const, id: packageId },
                                          mappingDictionary: {},
                                      });

                                setDataSourceMapping(temporalMapping);
                                setInstance(JSONDataSource.build(dhisVersion, contents));
                            } else {
                                setDataSourceMapping(mapping);
                                setInstance(source);
                            }
                        } else {
                            snackbar.error(i18n.t("Unknown error happened loading module"));
                        }
                    },
                });
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

                        setPackageContents(contents);
                        setDataSourceMapping(mapping ?? defaultMapping);
                        setInstance(JSONDataSource.build(dhisVersion, contents));
                    },
                });
            }
        },
        [compositionRoot, snackbar, packageImportRule]
    );

    useEffect(() => {
        updateDataSource(packageImportRule.source, packageFilter);
    }, [updateDataSource, packageFilter, packageImportRule.source]);

    useEffect(() => {
        if (packageContents && dataSourceMapping) {
            const mapeableModels = models.map(model => model.getCollectionName());

            const contentsIds: string[] = Object.entries(packageContents).reduce(
                (acc: string[], [key, items]) => {
                    const modelKey = key as keyof MetadataEntities;

                    const ids: string[] =
                        mapeableModels.includes(modelKey) && items
                            ? items.map(item => item.id)
                            : [];
                    return [...acc, ...ids];
                },
                []
            );

            const mappingIds: string[] = Object.entries(dataSourceMapping.mappingDictionary).reduce(
                (acc: string[], [_, mapping]) => [...acc, ...Object.keys(mapping)],
                []
            );

            const noMappedIds = _.difference(contentsIds, mappingIds);

            const message =
                contentsIds.length === 0
                    ? i18n.t("There are not elements to map in the package")
                    : noMappedIds.length === 0
                    ? i18n.t("Existing mapping will be used")
                    : noMappedIds.length < contentsIds.length
                    ? i18n.t(
                          "Some elements have been already mapped previously, please continue mapping remaining one or changed previous mapping"
                      )
                    : i18n.t("No mapping found");

            setMappingMessage(message);
        }
    }, [packageContents, dataSourceMapping]);

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
        <React.Fragment>
            {mappingMessage && (
                <Alert variant="outlined" severity="info" className={classes.alert}>
                    {mappingMessage}
                </Alert>
            )}
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
        </React.Fragment>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    alert: {
        textAlign: "center",
        margin: theme.spacing(2),
        display: "flex",
        justifyContent: "center",
    },
}));
