import { useSnackbar } from "d2-ui-components";
import React, { useEffect, useMemo, useState } from "react";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../../../../../domain/instance/entities/MetadataMapping";
import { isInstance } from "../../../../../domain/package-import/entities/PackageSource";
import { Package } from "../../../../../domain/packages/entities/Package";
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

export const PackageMappingStep: React.FC<PackageImportWizardProps> = ({
    packageImportRule,
    onChange,
}) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const [globalAdmin, setGlobalAdmin] = useState(false);
    const [packages, setPackages] = useState<Package[]>([]);

    const [packageFilter, setPackageFilter] = useState<string>(packageImportRule.packageIds[0]);
    const [currentMetadataMapping, setCurrentMetadataMapping] = useState<MetadataMappingDictionary>(
        {}
    );

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

    const onChangePackageFilter = (selectedPackageId: string) => {
        const metadataMapping = packageImportRule.mappingByPackageId[selectedPackageId] || {};

        setCurrentMetadataMapping(metadataMapping);
        setPackageFilter(selectedPackageId);
    };

    const onChangeMapping = async (metadataMapping: MetadataMappingDictionary) => {
        setCurrentMetadataMapping(metadataMapping);

        const metadataMappingsByPackageId = {
            ...packageImportRule.mappingByPackageId,
            [packageFilter]: metadataMapping,
        };
        onChange(packageImportRule.updateMappingsByPackageId(metadataMappingsByPackageId));

        // if (!instance) return;
        // const newInstance = instance.update({ metadataMapping });
        // await compositionRoot.instances.save(newInstance);
        // setInstance(newInstance);
    };

    const onApplyGlobalMapping = async (
        _type: string,
        _id: string,
        _subMapping: MetadataMapping
    ) => {
        // if (!instance) return;
        // const newMapping = _.clone(instance.metadataMapping);
        // _.set(newMapping, [type, id], { ...subMapping, global: true });
        // await onChangeMapping(newMapping);
    };

    const packageFilterComponent = (
        <Dropdown
            key="filter-package"
            items={packages}
            onValueChange={onChangePackageFilter}
            value={packageFilter}
            label={i18n.t("Package")}
            hideEmpty={true}
        />
    );

    const instance = useMemo(() => {
        if (isInstance(packageImportRule.source)) return packageImportRule.source;

        const storePackage = packages.find(({ id }) => id === packageFilter);

        return {
            type: "json" as const,
            version: storePackage?.dhisVersion ?? "",
            metadata: storePackage?.contents ?? {},
        };
    }, [packageImportRule.source, packageFilter, packages]);

    //TODO: mapping table reading from store

    return (
        <React.Fragment>
            <MappingTable
                models={models}
                instance={instance}
                mapping={currentMetadataMapping}
                globalMapping={currentMetadataMapping}
                onChangeMapping={onChangeMapping}
                onApplyGlobalMapping={onApplyGlobalMapping}
                externalFilterComponents={packageFilterComponent}
            />
        </React.Fragment>
    );
};
