import React from 'react';
import PropTypes from 'prop-types';
import i18n from "@dhis2/d2-i18n";

import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

class SaveButton extends React.Component {
    static propTypes = {
        isSaving: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
    };

    render() {
        const {
            isSaving,
            onClick,
            ...rest
        } = this.props;
        const buttonText = isSaving ? i18n.t('Saving...') : i18n.t('Save');
        return (
            <RaisedButton {...rest} primary onClick={onClick} label={buttonText} disabled={isSaving} />
        );
    }
}

export default SaveButton;