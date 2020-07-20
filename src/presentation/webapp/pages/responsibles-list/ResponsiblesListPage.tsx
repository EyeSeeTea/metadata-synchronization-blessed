import { MenuItem, Select } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../locales";
import { DataSetModel, ProgramModel } from "../../../../models/dhis/metadata";
import { useAppContext } from "../../../common/contexts/AppContext";
import MetadataTable from "../../components/metadata-table/MetadataTable";
import PageHeader from "../../components/page-header/PageHeader";

export const ResponsiblesListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();

    const [instances, setInstances] = useState<Instance[]>([]);
    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [responsibles, updateResponsibles] = useState<ExpandedMetadataResponsible[]>([]);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    useEffect(() => {
        compositionRoot.instances.list().then(setInstances);
    }, [compositionRoot]);

    useEffect(() => {
        compositionRoot.responsibles.list(remoteInstance).then(updateResponsibles);
    }, [compositionRoot, remoteInstance]);

    const updateSelectedInstance = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const originInstance = event.target.value as string;
            setRemoteInstance(instances.find(instance => instance.id === originInstance));
        },
        [instances]
    );

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Metadata responsibles")}>
                <Select
                    value={remoteInstance?.id ?? "LOCAL"}
                    onChange={updateSelectedInstance}
                    disableUnderline={true}
                    style={{ minWidth: 120, paddingLeft: 25, paddingRight: 25 }}
                >
                    {[{ id: "LOCAL", name: i18n.t("This instance") }, ...instances].map(
                        ({ id, name }) => (
                            <MenuItem key={id} value={id}>
                                {name}
                            </MenuItem>
                        )
                    )}
                </Select>
            </PageHeader>

            <MetadataTable
                remoteInstance={remoteInstance}
                models={[DataSetModel, ProgramModel]}
                allowChangingResponsible={true}
                forceSelectionColumn={false}
                filterRows={responsibles.map(({ id }) => id)}
            />
        </React.Fragment>
    );
};

interface ExpandedMetadataResponsible extends MetadataResponsible {
    name?: string;
    responsible?: never;
}

export default ResponsiblesListPage;
