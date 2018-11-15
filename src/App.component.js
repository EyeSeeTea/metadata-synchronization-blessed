import React, { Component } from 'react'
import PropTypes from 'prop-types'
import HeaderBar from '@dhis2/d2-ui-header-bar'
import { MuiThemeProvider } from '@material-ui/core/styles'
import JssProvider from 'react-jss/lib/JssProvider'
import { createGenerateClassName } from '@material-ui/core/styles'
import OldMuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import _ from 'lodash'

import { muiTheme } from './dhis2.theme'
import './App.css'
import SnackbarProvider from './components/feedback/SnackbarProvider.component'
import Root from './Root.component'
import Share from './components/share/Share.component'

const generateClassName = createGenerateClassName({
    dangerouslyUseGlobalCSS: false,
    productionPrefix: 'c',
})

class App extends Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        appConfig: PropTypes.object.isRequired,
    }

    componentDidMount() {
        const { d2, appConfig } = this.props
        const appKey = _(this.props.appConfig).get('appKey')

        if (appConfig && appConfig.feedback) {
            const feedbackOptions = {
                ...appConfig.feedback,
                i18nPath: 'feedback-tool/i18n',
            }
            window.$.feedbackDhis2(d2, appKey, feedbackOptions)
        }
    }

    render() {
        const { d2, appConfig } = this.props
        const showShareButton =
            _(appConfig).get('appearance.showShareButton') || false

        return (
            <React.Fragment>
                <JssProvider generateClassName={generateClassName}>
                    <MuiThemeProvider theme={muiTheme}>
                        <OldMuiThemeProvider>
                            <React.Fragment>
                                <HeaderBar d2={d2} />

                                <div className="content">
                                    <SnackbarProvider>
                                        <Root d2={d2} />
                                    </SnackbarProvider>
                                </div>

                                <Share visible={showShareButton} />
                            </React.Fragment>
                        </OldMuiThemeProvider>
                    </MuiThemeProvider>
                </JssProvider>
            </React.Fragment>
        )
    }
}

export default App
