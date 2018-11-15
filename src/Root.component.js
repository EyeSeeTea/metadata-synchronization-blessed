import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'

import { withFeedback, levels } from './components/feedback'

class Root extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        feedback: PropTypes.func.isRequired,
    }

    showFeedback = () => {
        this.props.feedback(levels.INFO, i18n.t('Hello there'))
    }

    render() {
        return (
            <React.Fragment>
                <p>Add your App components here</p>

                <button onClick={this.showFeedback}>
                    Click to show feedback
                </button>
            </React.Fragment>
        )
    }
}

export default withFeedback(Root)
