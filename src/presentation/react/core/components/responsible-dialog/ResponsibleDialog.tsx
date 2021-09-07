import { ShareUpdate } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useMemo } from "react";
import { NamedRef } from "../../../../../domain/common/entities/Ref";
import { MetadataEntities } from "../../../../../domain/metadata/entities/MetadataEntities";
import { MetadataResponsible } from "../../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import { SharingDialog } from "../sharing-dialog/SharingDialog";

export interface ResponsibleDialogProps {
    entity: keyof MetadataEntities;
    responsibles: MetadataResponsible[];
    sharingSettingsElement?: NamedRef;
    updateResponsibles: (responsibles: MetadataResponsible[]) => void;
    onClose: () => void;
}

export const ResponsibleDialog: React.FC<ResponsibleDialogProps> = ({
    entity,
    responsibles,
    sharingSettingsElement,
    updateResponsibles,
    onClose,
}) => {
    const { compositionRoot, api } = useAppContext();

    const onSharingChanged = async (update: ShareUpdate) => {
        if (!sharingSettingsElement) return;

        const { users: oldUsers = [], userGroups: oldUserGroups = [] } =
            responsibles.find(({ id }) => id === sharingSettingsElement.id) ?? {};

        const users = update.userAccesses?.map(({ id, displayName }) => ({ id, name: displayName })) ?? oldUsers;
        const userGroups =
            update.userGroupAccesses?.map(({ id, displayName }) => ({ id, name: displayName })) ?? oldUserGroups;

        const newResponsible: MetadataResponsible = {
            ...sharingSettingsElement,
            entity,
            users,
            userGroups,
        };

        await compositionRoot.responsibles.set(newResponsible);
        updateResponsibles(_.uniqBy([newResponsible, ...responsibles], "id"));
    };

    const onSearchRequest = (key: string) => api.sharing.search({ key }).getData();

    const sharingObject = useMemo(() => {
        if (!sharingSettingsElement) return undefined;

        const responsible = responsibles.find(({ id }) => id === sharingSettingsElement?.id);
        const { users = [], userGroups = [] } = responsible ?? {};

        return {
            object: {
                ...sharingSettingsElement,
                userAccesses: users.map(({ id, name }) => ({ id, displayName: name, access: "" })),
                userGroupAccesses: userGroups.map(({ id, name }) => ({
                    id,
                    displayName: name,
                    access: "",
                })),
            },
            meta: {},
        };
    }, [responsibles, sharingSettingsElement]);

    if (!sharingObject) return null;

    return (
        <SharingDialog
            isOpen={true}
            showOptions={{
                title: false,
                dataSharing: false,
                publicSharing: false,
                externalSharing: false,
                permissionPicker: false,
            }}
            title={i18n.t("Custodians for {{name}}", sharingSettingsElement)}
            meta={sharingObject}
            onCancel={onClose}
            onChange={onSharingChanged}
            onSearch={onSearchRequest}
        />
    );
};
