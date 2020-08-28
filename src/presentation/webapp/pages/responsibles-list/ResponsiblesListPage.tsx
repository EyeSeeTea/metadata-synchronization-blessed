import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../locales";
import { DataSetModel, ProgramModel } from "../../../../models/dhis/metadata";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../../common/components/instance-selection-dropdown/InstanceSelectionDropdown";
import { useAppContext } from "../../../common/contexts/AppContext";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";

export const ResponsiblesListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();

    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [responsibles, updateResponsibles] = useState<ExpandedMetadataResponsible[]>([]);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    const updateRemoteInstance = useCallback(
        (_type: InstanceSelectionOption, instance?: Instance) => {
            setRemoteInstance(instance);
        },
        []
    );

    useEffect(() => {
        compositionRoot.responsibles.list(remoteInstance).then(updateResponsibles);
    }, [compositionRoot, remoteInstance]);

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
                allowChangingResponsible={true}
                forceSelectionColumn={false}
                filterRows={responsibles.map(({ id }) => id)}
                showOnlySelectedFilter={false}
            />
        </React.Fragment>
    );
};

interface ExpandedMetadataResponsible extends MetadataResponsible {
    responsible?: never;
}

export default ResponsiblesListPage;
