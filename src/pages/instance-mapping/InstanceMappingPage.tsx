import i18n from "@dhis2/d2-i18n";
import { useD2 } from "d2-api";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MappingTable from "../../components/mapping-table/MappingTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    AggregatedDataElementModel,
    CategoryComboModel,
    CategoryOptionModel,
    OptionModel,
    OrganisationUnitModel,
    ProgramDataElementModel,
    EventProgramModel,
} from "../../models/d2Model";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { D2 } from "../../types/d2";

export type MappingType = "aggregated" | "tracker" | "orgUnit";

const config = {
    aggregated: {
        title: i18n.t("Aggregated metadata mapping"),
        models: [AggregatedDataElementModel],
        isGlobalMapping: false,
    },
    tracker: {
        title: i18n.t("Events metadata mapping"),
        models: [EventProgramModel],
        isGlobalMapping: false,
    },
    orgUnit: {
        title: i18n.t("Organisation unit metadata mapping"),
        models: [OrganisationUnitModel],
        isGlobalMapping: false,
    },
    global: {
        title: i18n.t("Global metadata mapping"),
        models: [CategoryOptionModel, CategoryComboModel, OptionModel, ProgramDataElementModel],
        isGlobalMapping: true,
    },
};

interface InstanceMappingParams {
    id: string;
    section: MappingType;
}

export default function InstanceMappingPage() {
    const history = useHistory();
    const d2 = useD2();

    const { id, section } = useParams() as InstanceMappingParams;
    const { models, title, isGlobalMapping } = config[section];

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        Instance.get(d2 as D2, id).then(setInstance);
    }, [d2, id]);

    const backHome = () => {
        history.push(`/instances/mapping/${id}`);
    };

    const onChangeMapping = async (mapping: MetadataMappingDictionary) => {
        if (!instance) return;

        const newInstance = instance.setMetadataMapping(mapping);
        await newInstance.save(d2 as D2);
        setInstance(newInstance);
    };

    const onApplyGlobalMapping = async (type: string, id: string, subMapping: MetadataMapping) => {
        if (!instance) return;

        const newMapping = _.clone(instance.metadataMapping);
        _.set(newMapping, [type, id], { ...subMapping, global: true });
        await onChangeMapping(newMapping);
    };

    return (
        <React.Fragment>
            <PageHeader
                title={instance ? `${title} (${instance?.name})` : title}
                onBackClick={backHome}
            />

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
