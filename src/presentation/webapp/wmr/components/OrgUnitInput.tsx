import React from "react";
import { Box, Button, TextField } from "@material-ui/core";
import { Check as CheckIcon, ErrorOutline as ErrorOutlineIcon } from "@material-ui/icons";
import { Id } from "../../../../domain/common/entities/Schemas";
import { Instance } from "../../../../domain/instance/entities/Instance";
import i18n from "../../../../utils/i18n";
import { useAppContext } from "../../../react/core/contexts/AppContext";
import { muiTheme } from "../../../react/core/themes/dhis2.theme";
type OrgUnitInputProps = { instance: Instance; onChange: (orgUnitId: Id) => void };

export function OrgUnitInput(props: OrgUnitInputProps) {
    const { instance, onChange } = props;
    const { compositionRoot } = useAppContext();
    const [value, setValue] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isValidated, setIsValidated] = React.useState<boolean>(false);

    const onValidate = React.useCallback(() => {
        setIsLoading(true);
        compositionRoot.wmr.validateOrgUnit(instance, value).run(
            isValid => {
                if (isValid) {
                    setError(null);
                    onChange(value as Id);
                } else {
                    setError(i18n.t("The Organisation Unit ID is not valid or does not exist in the target instance."));
                }
                setIsValidated(true);
                setIsLoading(false);
            },
            error => {
                console.error(error);
                setError(
                    i18n.t("There was a problem communicating with the instance. Please review the Instance settings.")
                );
                setIsLoading(false);
                setIsValidated(true);
            }
        );
    }, [compositionRoot.wmr, instance, onChange, value]);

    React.useEffect(() => {
        setIsValidated(false);
    }, [value]);

    return (
        <Box>
            <TextField
                label={i18n.t("Target Organisation Unit ID (*)")}
                value={value}
                onChange={e => setValue(e.target.value)}
                helperText={error ?? i18n.t("The ID of the Organisation Unit where the data will be submitted")}
                error={!!error}
                InputProps={{
                    endAdornment: !isValidated ? undefined : error ? (
                        <ErrorOutlineIcon htmlColor={muiTheme.palette.error.main} />
                    ) : (
                        <CheckIcon htmlColor={muiTheme.palette.success.main} />
                    ),
                }}
            />
            {!isValidated && (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onValidate}
                    style={{ marginTop: "10px", marginLeft: "10px" }}
                    disabled={!value || isLoading}
                >
                    {i18n.t("Validate Organisation Unit")}
                </Button>
            )}
        </Box>
    );
}
