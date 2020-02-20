import i18n from "@dhis2/d2-i18n";
import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import MappingTable from "../../components/mapping-table/MappingTable";
import PageHeader from "../../components/page-header/PageHeader";
import {
    AggregatedDataElementModel,
    CategoryComboModel,
    CategoryOptionModel,
    OrganisationUnitModel,
    ProgramDataElementModel,
} from "../../models/d2Model";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import { useD2 } from "d2-api";
import { D2 } from "../../types/d2";

export type MappingType = "aggregated" | "tracker" | "orgUnit";

const config = {
    aggregated: { models: [AggregatedDataElementModel, CategoryComboModel, CategoryOptionModel] },
    tracker: { models: [ProgramDataElementModel, CategoryComboModel, CategoryOptionModel] },
    orgUnit: { models: [OrganisationUnitModel] },
};

interface InstanceMappingParams {
    id: string;
    section: MappingType;
}

export default function InstanceMappingPage() {
    const history = useHistory();
    const d2 = useD2();

    const { id: instanceId = "", section } = useParams() as InstanceMappingParams;
    const { models } = config[section];

    const [instance, setInstance] = useState<Instance>();

    useEffect(() => {
        Instance.get(d2 as D2, instanceId).then(setInstance);
    }, [d2, instanceId]);

    const backHome = () => {
        history.push("/instances/mapping");
    };

    const onChangeMapping = async (mapping: MetadataMappingDictionary) => {
        if (!instance) return;

        const newInstance = instance.setMetadataMapping(mapping);
        await newInstance.save(d2 as D2);
        setInstance(newInstance);
    };

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Metadata mapping")} onBackClick={backHome} />

            {!!instance && (
                <MappingTable
                    models={models}
                    instance={instance}
                    mapping={instance.metadataMapping}
                    onChangeMapping={onChangeMapping}
                />
            )}
        </React.Fragment>
    );
}
