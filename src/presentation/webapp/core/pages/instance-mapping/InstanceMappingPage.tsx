import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { DataSourceMapping } from "../../../../../domain/mapping/entities/DataSourceMapping";
import { MetadataMapping, MetadataMappingDictionary } from "../../../../../domain/mapping/entities/MetadataMapping";
import i18n from "../../../../../locales";
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

export default function InstanceMappingPage() {
    const { compositionRoot } = useAppContext();
    const history = useHistory();

    const { id, section } = useParams() as InstanceMappingParams;
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

    const instanceTitle = instance ? i18n.t("Between this instance and {{name}}", instance) : null;
    const title = _.compact([sectionTitle, instanceTitle]).join(" - ");

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            {instance && dataSourceMapping && (
                <MappingTable
                    models={models}
                    destinationInstance={instance}
                    mapping={dataSourceMapping.mappingDictionary}
                    globalMapping={dataSourceMapping.mappingDictionary}
                    onChangeMapping={onChangeMapping}
                    onApplyGlobalMapping={onApplyGlobalMapping}
                />
            )}
        </React.Fragment>
    );
}
