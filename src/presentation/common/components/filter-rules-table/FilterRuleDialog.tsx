import React from "react";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import _ from "lodash";
import {
    FilterRule,
    FilterType,
    getInitialFilterRule,
    validateFilterRule,
    filterTypeNames,
    whereNames,
    updateFilterRule,
    FilterRuleStringMatch,
    FilterRuleMetadataType,
    FilterRuleCreated,
    FilterRuleLastUpdated,
} from "../../../../domain/metadata/entities/FilterRule";
import i18n from "../../../../locales";
import { isValueInUnionType } from "../../../../types/utils";
import Dropdown from "../../../webapp/components/dropdown/Dropdown";
import { matchByType } from "../../../../utils/unions-matching";
import PeriodSelection from "../../../webapp/components/period-selection/PeriodSelection";
import { PeriodType } from "../../../../utils/synchronization";
import { TextField, makeStyles } from "@material-ui/core";
import { metadataModels } from "../../../../models/dhis/factory";
import { useAppContext } from "../../contexts/AppContext";

export interface NewFilterRuleDialogProps {
    action: "new" | "edit";
    onClose(): void;
    onSave(filterRule: FilterRule): void;
    initialFilterRule: FilterRule;
}

const skipPeriods: Set<PeriodType> = new Set(["ALL"]);

export const FilterRuleDialog: React.FC<NewFilterRuleDialogProps> = props => {
    const { onClose, onSave, action, initialFilterRule } = props;
    const { api } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const [filterRule, setFilterRule] = React.useState<FilterRule>(initialFilterRule);

    const filterTypeItems = React.useMemo(() => {
        return _.map(filterTypeNames, (name, key) => ({ id: key, name }));
    }, []);

    const whereItems = React.useMemo(() => {
        return _.map(whereNames, (name, key) => ({ id: key, name }));
    }, []);

    const metadataTypeItems = React.useMemo(() => {
        return metadataModels.map(model => ({
            id: model.getMetadataType(),
            name: model.getModelName(api),
        }));
    }, [api]);

    const changeFilterType = React.useCallback(
        (newFilterType: string) => {
            const filterTypes = _.keys(filterTypeNames) as FilterType[];

            if (isValueInUnionType(newFilterType, filterTypes)) {
                setFilterRule(filterRule => getInitialFilterRule(newFilterType, filterRule.id));
            }
        },
        [setFilterRule]
    );

    function updateField<FR extends FilterRule, Field extends keyof FR = keyof FR>(field: Field) {
        return function (value: FR[Field]) {
            setFilterRule(filterRule =>
                updateFilterRule<FR, Field>(filterRule as FR, field, value)
            );
        };
    }

    function updateFieldFromEvent<FR extends FilterRule, Field extends keyof FR = keyof FR>(
        field: Field
    ) {
        return function (ev: React.ChangeEvent<{ value: FR[Field] }>) {
            const value = ev.target.value as FR[Field];
            setFilterRule((filterRule: FilterRule) => {
                return updateFilterRule<FR, Field>(filterRule as FR, field, value);
            });
        };
    }

    const save = React.useCallback(() => {
        const errors = validateFilterRule(filterRule);
        if (_.isEmpty(errors)) {
            onSave(filterRule);
        } else {
            snackbar.error(errors.map(error => error.description).join("\n"));
        }
    }, [filterRule, onSave, snackbar]);

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
            <div className={classes.dropdown}>
                <Dropdown
                    items={filterTypeItems}
                    onValueChange={changeFilterType}
                    value={filterRule.type}
                    label={i18n.t("Filter type")}
                />
            </div>

            {matchByType(filterRule, {
                created: rule => {
                    return (
                        <PeriodSelection
                            objectWithPeriod={rule.value}
                            skipPeriods={skipPeriods}
                            onChange={updateField<FilterRuleCreated>("value")}
                        />
                    );
                },
                lastUpdated: rule => {
                    return (
                        <PeriodSelection
                            objectWithPeriod={rule.value}
                            skipPeriods={skipPeriods}
                            onChange={updateField<FilterRuleLastUpdated>("value")}
                        />
                    );
                },
                stringMatch: rule => {
                    return (
                        <React.Fragment>
                            <div>
                                <Dropdown
                                    items={whereItems}
                                    onValueChange={updateField<FilterRuleStringMatch>("where")}
                                    value={rule.where}
                                    label={i18n.t("Where")}
                                />
                            </div>

                            <div className={classes.textField}>
                                <TextField
                                    fullWidth={true}
                                    onChange={updateFieldFromEvent<FilterRuleStringMatch>("value")}
                                    label={i18n.t(
                                        "String to match in name / code / description (*)"
                                    )}
                                    value={rule.value}
                                />
                            </div>
                        </React.Fragment>
                    );
                },
                metadataType: rule => {
                    return (
                        <div>
                            <Dropdown
                                items={metadataTypeItems}
                                onValueChange={updateField<FilterRuleMetadataType>("value")}
                                value={rule.value}
                                label={i18n.t("Model")}
                            />
                        </div>
                    );
                },
            })}
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles({
    dropdown: {
        marginBottom: 20,
    },
    textField: {
        marginLeft: 10,
    },
});

/*
interface FilterArgumentsProps {
    filterRule: FilterRule;
}

const FilterArguments: React.FC<FilterArgumentsProps> = props => {
    const { filterRule } = props;
    console.log(filterRule);
    return <div>arguments</div>;
};
*/
