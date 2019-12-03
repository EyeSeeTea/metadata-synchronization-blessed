import React from "react";
import i18n from "@dhis2/d2-i18n";
import GenericSynchronizationPage from "./GenericSynchronizationPage";
import {
    AggregatedDataElementModel,
    DataElementGroupModel,
    DataElementGroupSetModel,
    DataSetModel,
    ProgramDataElementModel,
} from "../../models/d2Model";
import { useParams } from "react-router-dom";

const DataPage: React.FC = () => {
    const { type } = useParams();
    const title =
        type === "aggregated"
            ? i18n.t("Aggregated Data Synchronization")
            : i18n.t("Program Data Syncrhonization");
    const models =
        type === "aggregated"
            ? [
                  AggregatedDataElementModel,
                  DataElementGroupModel,
                  DataElementGroupSetModel,
                  DataSetModel,
              ]
            : [ProgramDataElementModel];

    return <GenericSynchronizationPage models={models} title={title} />;
};

export default DataPage;
