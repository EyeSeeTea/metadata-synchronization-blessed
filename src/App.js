import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderBar from '@dhis2/d2-ui-header-bar';
import i18n from '@dhis2/d2-i18n';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { muiTheme } from './config/dhis2.theme';
import './App.css';

class App extends Component {
  static childContextTypes = {
      d2: PropTypes.object,
  };

  static propTypes = {
      d2: PropTypes.object.isRequired,
  };

  getChildContext() {
      return {
          d2: this.props.d2,
      };
  }

  render() {
    const { d2 } = this.props;

    return (
      <React.Fragment>
        <MuiThemeProvider theme={muiTheme}>
          <HeaderBar d2={d2} />

          <Paper className="welcome">
            {i18n.t("Hello there")}
          </Paper>
        </MuiThemeProvider>
      </React.Fragment>
    );
  }
}

export default App;
