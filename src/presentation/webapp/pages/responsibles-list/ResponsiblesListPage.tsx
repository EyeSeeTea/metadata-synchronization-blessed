import { MenuItem, Select } from "@material-ui/core";
import { ObjectsTable, TableColumn } from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import PageHeader from "../../components/page-header/PageHeader";

export const ResponsiblesListPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [selectedInstance, setSelectedInstance] = useState<Instance>();
    const [responsibles, setResponsibles] = useState<MetadataResponsible[]>([]);

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    useEffect(() => {
        compositionRoot.instances().list().then(setInstances);
    }, [compositionRoot]);

    useEffect(() => {
        compositionRoot.responsibles.list(selectedInstance).then(setResponsibles);
    }, [compositionRoot, selectedInstance]);

    const updateSelectedInstance = useCallback(
        (event: React.ChangeEvent<{ value: unknown }>) => {
            const originInstance = event.target.value as string;
            setSelectedInstance(instances.find(instance => instance.id === originInstance));
        },
        [instances]
    );

    const columns: TableColumn<MetadataResponsible>[] = [{ name: "id", text: i18n.t("ID") }];

    return (
        <React.Fragment>
            <PageHeader onBackClick={backHome} title={i18n.t("Metadata responsibles")}>
                <Select
                    value={selectedInstance?.id ?? "LOCAL"}
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

            <ObjectsTable<MetadataResponsible> rows={responsibles} columns={columns} />
        </React.Fragment>
    );
};

export default ResponsiblesListPage;
