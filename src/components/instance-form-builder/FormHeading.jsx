import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";

import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";

const iconStyle = { marginBottom: 7 };

function FormHeading({ variant, title, onBackClick }) {
    return (
        <div>
            <IconButton
                onClick={onBackClick}
                color="secondary"
                aria-label={i18n.t("Back")}
                style={iconStyle}
            >
                <Icon color="primary">arrow_back</Icon>
            </IconButton>

            <Typography variant={variant} gutterBottom style={{ display: "inline-block" }}>
                {title}
            </Typography>
        </div>
    );
}

FormHeading.propTypes = {
    variant: PropTypes.string,
    title: PropTypes.string.isRequired,
    onBackClick: PropTypes.func.isRequired,
};

FormHeading.defaultProps = {
    variant: "h5",
};

export default FormHeading;
