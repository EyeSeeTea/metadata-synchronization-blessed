import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import _ from "lodash";
import { withSnackbar } from "d2-ui-components";

import MetadataTable from "../../metadata-table/MetadataTable";
import {
    DataElementModel,
    IndicatorModel,
    OrganisationUnitModel,
    ValidationRuleModel,
} from "../../../models/d2Model";

class MetadataSelectionStep extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        syncRule: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    state = {
        selectedIds: [],
    };

    models = [DataElementModel, IndicatorModel, OrganisationUnitModel, ValidationRuleModel];

    componentDidMount() {
        const { selectedIds } = this.props.syncRule;
        this.setState({ selectedIds });
    }

    changeSelection = (model, selectedIds) => {
        const { selectedIds: oldSelection } = this.state;
        const { d2, snackbar, syncRule, onChange } = this.props;
        const type = model.getD2Model(d2).plural;

        const additions = _.difference(selectedIds, oldSelection);
        if (additions.length > 0) {
            onChange(syncRule.addMetadataIds(type, additions));
            snackbar.info(
                i18n.t("Selected {{difference}} elements", { difference: additions.length }),
                {
                    autoHideDuration: 1000,
                }
            );
        }

        const removals = _.difference(oldSelection, selectedIds);
        if (removals.length > 0) {
            onChange(syncRule.removeMetadataIds(removals));
            snackbar.info(
                i18n.t("Removed {{difference}} elements", {
                    difference: Math.abs(removals.length),
                }),
                { autoHideDuration: 1000 }
            );
        }

        this.setState({ selectedIds });
    };

    render() {
        const { d2, syncRule, ...rest } = this.props;

        return (
            <MetadataTable
                d2={d2}
                notifyNewSelection={this.changeSelection}
                initialSelection={syncRule.selectedIds}
                models={this.models}
                {...rest}
            />
        );
    }
}

export default withSnackbar(MetadataSelectionStep);
