import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import DeleteIcon from "@material-ui/icons/Delete";
import { withLoading } from "d2-ui-components";

import GenericSynchronizationPage from "./GenericSynchronizationPage";
import DeletedObject from "../../models/deletedObjects";

class DeletedObjectsPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    state = {
        filters: {
            deletedAtFilter: null,
            deletedByFilter: null,
            metadataTypeFilter: null,
        },
    };

    models = [
        {
            getInitialSorting: () => ["deletedAt", "desc"],
            getColumns: () => [
                { name: "id", text: i18n.t("Identifier"), sortable: true },
                { name: "code", text: i18n.t("Code"), sortable: true },
                { name: "klass", text: i18n.t("Metadata type"), sortable: true },
                { name: "deletedAt", text: i18n.t("Deleted date"), sortable: true },
                { name: "deletedBy", text: i18n.t("Deleted by"), sortable: true },
            ],
            getDetails: () => [
                { name: "id", text: i18n.t("Identifier") },
                { name: "code", text: i18n.t("Code") },
                { name: "klass", text: i18n.t("Metadata type") },
                { name: "deletedAt", text: i18n.t("Deleted date") },
                { name: "deletedBy", text: i18n.t("Deleted by") },
            ],
            getGroupFilterName: () => null,
            getLevelFilterName: () => null,
            getMetadataType: () => "deletedObjects",
            getD2Model: () => ({
                displayName: "Deleted Objects",
                modelValidations: {
                    updatedAt: { type: "DATE" },
                },
            }),
        },
    ];

    render() {
        const { d2 } = this.props;

        const title = i18n.t("Deleted Objects Synchronization");
        const buttonLabel = <DeleteIcon />;

        return (
            <GenericSynchronizationPage
                d2={d2}
                title={title}
                models={this.models}
                list={DeletedObject.list}
                isDelete={true}
                buttonLabel={buttonLabel}
            />
        );
    }
}

export default withLoading(DeletedObjectsPage);
