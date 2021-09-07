import { makeStyles } from "@material-ui/core";
import { ConfirmationDialog, useSnackbar } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import {
    FilterRule,
    FilterRuleField,
    FilterWhere,
    updateFilterRule,
    updateStringMatch,
    validateFilterRule,
    whereNames,
} from "../../../../../domain/metadata/entities/FilterRule";
import i18n from "../../../../../locales";
import { metadataModels } from "../../../../../models/dhis/factory";
import Dropdown from "../dropdown/Dropdown";
import PeriodSelection from "../period-selection/PeriodSelection";
import TextFieldOnBlur from "../text-field-on-blur/TextFieldOnBlur";
import { Section } from "./Section";

export interface NewFilterRuleDialogProps {
    action: "new" | "edit";
    onClose(): void;
    onSave(filterRule: FilterRule): void;
    initialFilterRule: FilterRule;
}

export const FilterRuleDialog: React.FC<NewFilterRuleDialogProps> = props => {
    const { onClose, onSave, action, initialFilterRule } = props;
    const classes = useStyles();
    const snackbar = useSnackbar();
    const [filterRule, setFilterRule] = useState<FilterRule>(initialFilterRule);

    const metadataTypeItems = useMemo(() => {
        return metadataModels.map(model => ({
            id: model.getMetadataType(),
            name: model.getModelName(),
        }));
    }, []);

    function updateField<Field extends FilterRuleField>(field: Field) {
        return function (value: FilterRule[Field]) {
            setFilterRule(filterRule => updateFilterRule<Field>(filterRule, field, value));
        };
    }

    const save = useCallback(() => {
        const errors = validateFilterRule(filterRule);
        if (_.isEmpty(errors)) {
            onSave(filterRule);
        } else {
            snackbar.error(errors.map(error => error.description).join("\n"));
        }
    }, [filterRule, onSave, snackbar]);

    function updateStringMatchWhere(where: FilterWhere | "") {
        const value = { where: where || null, ...(where ? {} : { value: "" }) };
        setFilterRule(filterRule => updateStringMatch(filterRule, value));
    }

    const title = action === "new" ? i18n.t("Create new filter") : i18n.t("Edit filter");
    const saveText = action === "new" ? i18n.t("Create") : i18n.t("Update");

    return (
        <ConfirmationDialog
            open={!!filterRule}
            maxWidth="sm"
            fullWidth={true}
            title={title}
            onCancel={onClose}
            onSave={save}
            cancelText={i18n.t("Cancel")}
            saveText={saveText}
        >
            <React.Fragment>
                <Section title={i18n.t("Metadata type")}>
                    <Dropdown
                        items={metadataTypeItems}
                        onValueChange={updateField("metadataType")}
                        value={filterRule.metadataType}
                    />
                </Section>

                <Section title={i18n.t("Created")}>
                    <PeriodSelection objectWithPeriod={filterRule.created} onChange={updateField("created")} />
                </Section>

                <Section title={i18n.t("Last updated")}>
                    <PeriodSelection objectWithPeriod={filterRule.lastUpdated} onChange={updateField("lastUpdated")} />
                </Section>

                <Section title={i18n.t("Match string (name, code, description)")}>
                    <div className={classes.dropdown}>
                        <Dropdown
                            items={whereItems}
                            onValueChange={updateStringMatchWhere}
                            value={filterRule.stringMatch?.where || ""}
                            label={i18n.t("Condition")}
                        />
                    </div>

                    <div className={classes.textField}>
                        <TextFieldOnBlur
                            className={classes.dropdown}
                            fullWidth={true}
                            onChange={value => setFilterRule(filterRule => updateStringMatch(filterRule, { value }))}
                            label={i18n.t("String to match (*)")}
                            value={filterRule.stringMatch?.value || ""}
                        />
                    </div>
                </Section>
            </React.Fragment>
        </ConfirmationDialog>
    );
};

const whereItems = _.map(whereNames, (name, key) => ({ id: key, name }));

const useStyles = makeStyles({
    dropdown: {
        marginTop: 20,
    },
    textField: {
        marginLeft: 10,
    },
});
