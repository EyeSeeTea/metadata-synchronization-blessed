import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Id } from "../../../../../domain/common/entities/Schemas";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { DataSourceMapping } from "../../../../../domain/mapping/entities/DataSourceMapping";
import { MetadataMapping, MetadataMappingDictionary } from "../../../../../domain/mapping/entities/MetadataMapping";
import i18n from "../../../../../utils/i18n";
import {
    AggregatedDataElementModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    EventProgramWithProgramStagesMappedModel,
    GlobalCategoryComboModel,
    GlobalCategoryModel,
    GlobalCategoryOptionGroupModel,
    GlobalCategoryOptionGroupSetModel,
    GlobalCategoryOptionModel,
    GlobalDataElementModel,
    GlobalOptionModel,
    IndicatorMappedModel,
    OrganisationUnitMappedModel,
    ProgramIndicatorMappedModel,
    ProgramWithDataElementsToAggregatedModel,
    RelationshipTypeMappedModel,
    TrackedEntityAttributeToDEMappedModel,
    TrackedEntityAttributeToTEIMappedModel,
} from "../../../../../models/dhis/mapping";
import MappingTable from "../../../../react/core/components/mapping-table/MappingTable";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { useAppContext } from "../../../../react/core/contexts/AppContext";

export type MappingType = "aggregated" | "tracker" | "orgUnit";

const config = {
    aggregated: {
        title: i18n.t("Aggregated mapping"),
        models: [AggregatedDataElementModel, IndicatorMappedModel],
    },
    tracker: {
        title: i18n.t("Program (events) mapping"),
        models: [
            EventProgramWithDataElementsModel,
            EventProgramWithProgramStagesMappedModel,
            ProgramWithDataElementsToAggregatedModel,
            EventProgramWithIndicatorsModel,
            ProgramIndicatorMappedModel,
            RelationshipTypeMappedModel,
            TrackedEntityAttributeToTEIMappedModel,
            TrackedEntityAttributeToDEMappedModel,
        ],
    },
    orgUnit: {
        title: i18n.t("Organisation unit mapping"),
        models: [OrganisationUnitMappedModel],
    },
    global: {
        title: i18n.t("Global mapping"),
        models: [
            GlobalCategoryModel,
            GlobalCategoryComboModel,
            GlobalCategoryOptionModel,
            GlobalCategoryOptionGroupModel,
            GlobalCategoryOptionGroupSetModel,
            GlobalDataElementModel,
            GlobalOptionModel,
        ],
    },
};

interface InstanceMappingParams {
    id: string;
    section: MappingType;
}

export type InstanceMappingProps = {
    instanceId?: string;
    section?: MappingType;
    showHeader?: boolean;
    filterRows?: Id[];
    filterMappingIds?: Id[];
    /**
     * If true, only Ids from filterMappingIds will be allowed to be auto-mapped.
     */
    applyFilterMappingIdsToAutoMap?: boolean;
};

export function useDefaultParams(props: InstanceMappingProps): InstanceMappingParams {
    const { id, section } = useParams() as InstanceMappingParams;
    return {
        id: id ?? props.instanceId ?? "LOCAL",
        section: section ?? props.section ?? "aggregated",
    };
}

export default function InstanceMappingPage(props: InstanceMappingProps) {
    const { showHeader = true } = props;
    const { compositionRoot } = useAppContext();
    const history = useHistory();

    const { id, section } = useDefaultParams(props);
    const { models, title: sectionTitle } = config[section];

    const [dataSourceMapping, setDataSourceMapping] = useState<DataSourceMapping>();
    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        compositionRoot.instances.getById(id).then(result =>
            result.match({
                success: setInstance,
                error: () => {},
            })
        );

        compositionRoot.mapping.get({ type: "instance", id }).then(result => {
            setDataSourceMapping(
                result ??
                    DataSourceMapping.build({
                        owner: {
                            type: "instance" as const,
                            id,
                        },
                        mappingDictionary: {},
                    })
            );
        });
    }, [compositionRoot, id]);

    const backHome = () => {
        history.push(`/instances/mapping/${id}`);
    };

    const onChangeMapping = async (metadataMapping: MetadataMappingDictionary) => {
        if (!dataSourceMapping) return;

        const newDataSourceMapping = dataSourceMapping.updateMappingDictionary(metadataMapping);
        await compositionRoot.mapping.save(newDataSourceMapping);
        setDataSourceMapping(newDataSourceMapping);
    };

    const onApplyGlobalMapping = async (type: string, id: string, subMapping: MetadataMapping) => {
        if (!dataSourceMapping) return;

        const newMapping = _.clone(dataSourceMapping.mappingDictionary);
        _.set(newMapping, [type, id], { ...subMapping, global: true });
        await onChangeMapping(newMapping);
    };

    const instanceTitle = instance
        ? i18n.t("Between this instance and {{name}}", { name: instance.name, interpolation: { escapeValue: false } })
        : null;
    const title = _.compact([sectionTitle, instanceTitle]).join(" - ");

    return (
        <React.Fragment>
            {showHeader && <PageHeader title={title} onBackClick={backHome} />}

            {instance && dataSourceMapping && (
                <MappingTable
                    models={models}
                    destinationInstance={instance}
                    mapping={dataSourceMapping.mappingDictionary}
                    globalMapping={dataSourceMapping.mappingDictionary}
                    onChangeMapping={onChangeMapping}
                    onApplyGlobalMapping={onApplyGlobalMapping}
                    filterRows={props.filterRows}
                    filterMappingIds={props.filterMappingIds}
                    applyFilterMappingIdsToAutoMap={props.applyFilterMappingIdsToAutoMap}
                />
            )}
        </React.Fragment>
    );
}
