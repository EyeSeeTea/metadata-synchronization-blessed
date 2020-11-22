import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import { DataSetModel, ProgramModel } from "../../../../models/dhis/metadata";
import { isAppConfigurator } from "../../../../utils/permissions";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../../react/components/instance-selection-dropdown/InstanceSelectionDropdown";
import MetadataTable from "../../../react/components/metadata-table/MetadataTable";
import PageHeader from "../../../react/components/page-header/PageHeader";
import { useAppContext } from "../../../react/contexts/AppContext";

export const ResponsiblesListPage: React.FC = () => {
    const { compositionRoot, api } = useAppContext();
    const history = useHistory();

    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [responsibles, updateResponsibles] = useState<ExpandedMetadataResponsible[]>([]);
    const [appConfigurator, updateAppConfigurator] = useState(false);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const updateRemoteInstance = useCallback(
        (_type: InstanceSelectionOption, instance?: Instance | Store) => {
            setRemoteInstance(instance !== undefined ? (instance as Instance) : undefined);
        },
        []
    );

    useEffect(() => {
        compositionRoot.responsibles.list(remoteInstance).then(updateResponsibles);
    }, [compositionRoot, remoteInstance]);

    useEffect(() => {
        isAppConfigurator(api).then(updateAppConfigurator);
    }, [api, updateAppConfigurator]);

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Metadata custodians")}>
                <InstanceSelectionDropdown
                    view="inline"
                    showInstances={{ local: true, remote: true }}
                    selectedInstance={remoteInstance?.id ?? "LOCAL"}
                    onChangeSelected={updateRemoteInstance}
                />
            </PageHeader>

            <MetadataTable
                remoteInstance={remoteInstance}
                models={[DataSetModel, ProgramModel]}
                allowChangingResponsible={appConfigurator}
                forceSelectionColumn={false}
                filterRows={responsibles.map(({ id }) => id)}
                viewFilters={["group", "level", "orgUnit", "lastUpdated"]}
            />
        </React.Fragment>
    );
};

interface ExpandedMetadataResponsible extends MetadataResponsible {
    responsible?: never;
}

export default ResponsiblesListPage;
