import { MetaObject, SearchResult, ShareUpdate, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { MetadataResponsible } from "../../../../domain/metadata/entities/MetadataResponsible";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import { SharingDialog } from "../../components/sharing-dialog/SharingDialog";

export interface ResponsibleDialogProps {
    responsibles: MetadataResponsible[];
    updateResponsibles: (responsibles: MetadataResponsible[]) => void;
    sharingSettingsObject?: MetaObject;
    setSharingSettingsObject: (object?: MetaObject) => void;
}

export const ResponsibleDialog: React.FC<ResponsibleDialogProps> = ({
    responsibles,
    updateResponsibles,
    sharingSettingsObject,
    setSharingSettingsObject,
}) => {
    const { compositionRoot, api } = useAppContext();
    const snackbar = useSnackbar();

    const onSharingChanged = async (update: ShareUpdate) => {
        if (!sharingSettingsObject) return;

        const newSharingsObject = { ...sharingSettingsObject.object, ...update };
        const oldResponsible = responsibles.find(({ id }) => newSharingsObject.id === id);
        if (!oldResponsible) {
            snackbar.error("Could not update sharing settings");
            return;
        }

        const newResponsible = { ...oldResponsible, ...update };
        setSharingSettingsObject({ meta: {}, object: newSharingsObject });
        await compositionRoot.responsibles.set(newResponsible);
        updateResponsibles(_.uniqBy([newResponsible, ...responsibles], "id"));
    };

    const onSearchRequest = async (key: string) =>
        api
            .get<SearchResult>("/sharing/search", { key })
            .getData();

    if (!sharingSettingsObject) return null;

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
            title={i18n.t("Sharing settings for {{name}}", sharingSettingsObject.object)}
            meta={sharingSettingsObject}
            onCancel={() => setSharingSettingsObject(undefined)}
            onChange={onSharingChanged}
            onSearch={onSearchRequest}
        />
    );
};
