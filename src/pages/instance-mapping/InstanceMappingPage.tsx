import i18n from "@dhis2/d2-i18n";
import { useD2Api } from "d2-api";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MappingTable from "../../components/mapping-table/MappingTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    AggregatedDataElementModel,
    CategoryOptionsGlobalModel,
    EventProgramWithDataElementsModel,
    EventProgramWithIndicatorsModel,
    IndicatorMappedModel,
    ProgramDataElementModel,
} from "../../models/complexModels";
import { CategoryComboModel, OptionModel, OrganisationUnitModel } from "../../models/d2Model";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";

export type MappingType = "aggregated" | "tracker" | "orgUnit";

const config = {
    aggregated: {
        title: i18n.t("Aggregated mapping"),
        models: [AggregatedDataElementModel, IndicatorMappedModel],
        isGlobalMapping: false,
    },
    tracker: {
        title: i18n.t("Program (events) mapping"),
        models: [EventProgramWithDataElementsModel, EventProgramWithIndicatorsModel],
        isGlobalMapping: false,
    },
    orgUnit: {
        title: i18n.t("Organisation unit mapping"),
        models: [OrganisationUnitModel],
        isGlobalMapping: false,
    },
    global: {
        title: i18n.t("Global mapping"),
        models: [
            CategoryOptionsGlobalModel,
            CategoryComboModel,
            OptionModel,
            ProgramDataElementModel,
        ],
        isGlobalMapping: true,
    },
};

interface InstanceMappingParams {
    id: string;
    section: MappingType;
}

export default function InstanceMappingPage() {
    const history = useHistory();
    const api = useD2Api();

    const { id, section } = useParams() as InstanceMappingParams;
    const { models, title: sectionTitle, isGlobalMapping } = config[section];

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        Instance.get(api, id).then(setInstance);
    }, [api, id]);

    const backHome = () => {
        history.push(`/instances/mapping/${id}`);
    };

    const onChangeMapping = async (mapping: MetadataMappingDictionary) => {
        if (!instance) return;

        const newInstance = instance.setMetadataMapping(mapping);
        await newInstance.save(api);
        setInstance(newInstance);
    };

    const onApplyGlobalMapping = async (type: string, id: string, subMapping: MetadataMapping) => {
        if (!instance) return;

        const newMapping = _.clone(instance.metadataMapping);
        _.set(newMapping, [type, id], { ...subMapping, global: true });
        await onChangeMapping(newMapping);
    };

    const instanceTitle = instance ? i18n.t("Destination instance {{name}}", instance) : undefined;
    const title = _.compact([sectionTitle, instanceTitle]).join(" - ");

    return (
        <React.Fragment>
            <PageHeader title={title} onBackClick={backHome} />

            {!!instance && (
                <MappingTable
                    models={models}
                    instance={instance}
                    mapping={instance.metadataMapping}
                    globalMapping={instance.metadataMapping}
                    onChangeMapping={onChangeMapping}
                    onApplyGlobalMapping={onApplyGlobalMapping}
                    isGlobalMapping={isGlobalMapping}
                />
            )}
        </React.Fragment>
    );
}
