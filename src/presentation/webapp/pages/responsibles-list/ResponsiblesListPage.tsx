import { Icon, MenuItem, Select } from "@material-ui/core";
import { MetaObject, ObjectsTable, TableAction, TableColumn } from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import PageHeader from "../../components/page-header/PageHeader";
import { ResponsibleDialog } from "../../components/responsible-dialog/ResponsibleDialog";

export const ResponsiblesListPage: React.FC = () => {
    const { compositionRoot, api } = useAppContext();
    const history = useHistory();

    const [instances, setInstances] = useState<Instance[]>([]);
    const [remoteInstance, setRemoteInstance] = useState<Instance>();
    const [responsibles, updateResponsibles] = useState<ExpandedMetadataResponsible[]>([]);
    const [sharingSettingsObject, setSharingSettingsObject] = useState<MetaObject>();

    const backHome = useCallback(() => {
        history.push("/");
    }, [history]);

    useEffect(() => {
        compositionRoot.instances().list().then(setInstances);
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

    const openResponsibleDialog = (ids: string[]) => {
        const { id, name } = responsibles.find(({ id }) => ids[0] === id) ?? {};
        if (!id || !name) return;

        const { userAccesses = [], userGroupAccesses = [] } =
            responsibles.find(item => item.id === id) ?? {};

        setSharingSettingsObject({
            object: { id, name, userAccesses, userGroupAccesses },
            meta: {},
        });
    };

    const columns: TableColumn<ExpandedMetadataResponsible>[] = [
        {
            name: "entity",
            text: i18n.t("Model"),
            getValue: ({ entity }: ExpandedMetadataResponsible) => {
                return api.models[entity].schema.displayName;
            },
        },
        { name: "name", text: i18n.t("Name") },
        {
            name: "responsible",
            text: i18n.t("Responsible"),
            getValue: ({ userAccesses, userGroupAccesses }: ExpandedMetadataResponsible) => {
                return [...userAccesses, ...userGroupAccesses].map(({ name }) => name).join(", ");
            },
        },
    ];

    const actions: TableAction<ExpandedMetadataResponsible>[] = [
        {
            name: "set-responsible",
            text: i18n.t("Set responsible users"),
            multiple: false,
            icon: <Icon>supervisor_account</Icon>,
            onClick: openResponsibleDialog,
            isActive: () => !remoteInstance,
        },
    ];

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

            <ResponsibleDialog
                responsibles={responsibles}
                updateResponsibles={updateResponsibles}
                sharingSettingsObject={sharingSettingsObject}
                setSharingSettingsObject={setSharingSettingsObject}
            />

            <ObjectsTable<ExpandedMetadataResponsible>
                rows={responsibles}
                columns={columns}
                actions={actions}
            />
        </React.Fragment>
    );
};

interface ExpandedMetadataResponsible extends MetadataResponsible {
    name?: string;
    responsible?: never;
}

export default ResponsiblesListPage;
