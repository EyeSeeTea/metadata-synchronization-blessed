import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import i18n from "../../../../../locales";

const useStyles = makeStyles(() => ({
    button: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
        height: 36,
        width: 140,
        borderRadius: 0,
        marginRight: 20,
        marginLeft: 0,
    },
}));

interface SaveButtonProps {
    isSaving?: boolean;
    onClick: () => void;
}

const SaveButton = ({ isSaving, onClick, ...rest }: SaveButtonProps) => {
    const classes = useStyles();
    const buttonText = isSaving ? i18n.t("Saving...") : i18n.t("Save");

    return (
        <Button onClick={onClick} variant="contained" disabled={isSaving} className={classes.button} {...rest}>
            {buttonText}
        </Button>
    );
};

export default SaveButton;
