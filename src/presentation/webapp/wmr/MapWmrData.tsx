import React from "react";
import { Grid } from "@material-ui/core";
import { Dropdown } from "@eyeseetea/d2-ui-components";
import i18n from "../../../utils/i18n";
import InstanceMappingPage from "../core/pages/instance-mapping/InstanceMappingPage";
import { WmrSettings } from "../../../domain/entities/wmr/entities/WmrSettings";
import { Id } from "../../../domain/common/entities/Schemas";
import { useWmrContext } from "./context/WmrContext";
import { Maybe } from "../../../types/utils";
import { NoticeBox } from "./components/NoticeBox";

type MapWmrDataProps = {};

export function MapWmrData(_props: MapWmrDataProps) {
    const { syncRule, settings, loadSettings } = useWmrContext();
    const [dataSetId, setDataSetId] = React.useState<Maybe<Id>>(syncRule?.localDataSetId);

    React.useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    if (!settings || !syncRule) {
        return <NoticeBox type="loading" message={i18n.t("Loading settings...")} />;
    }

    const dataSets = settings.dataSets.map(dataSet => {
        return { text: dataSet.name, value: dataSet.id };
    });

    const onChangeDataSet = (value: Id | undefined) => {
        setDataSetId(value);
        syncRule.localDataSetId = value;
    };

    const allowedLocalDataElementsIds = settings.getDataElementsIds(dataSetId);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <NoticeBox
                    type="info"
                    message={i18n.t("Select a DataSet. Then map your server data to the newly created test WMR form")}
                />
            </Grid>
            <Grid item xs={12}>
                <Dropdown
                    items={dataSets}
                    label={i18n.t("Select a DataSet")}
                    onChange={onChangeDataSet}
                    value={dataSetId ?? ""}
                />
            </Grid>
            {dataSetId && (
                <Grid item xs={12}>
                    <InstanceMappingPage
                        instanceId={WmrSettings.LOCAL_INSTANCE_ID}
                        section="aggregated"
                        showHeader={false}
                        filterRows={allowedLocalDataElementsIds}
                        filterMappingIds={settings.countryDataElementsIds}
                        applyFilterMappingIdsToAutoMap
                    />
                </Grid>
            )}
        </Grid>
    );
}
