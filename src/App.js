import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderBar from '@dhis2/d2-ui-header-bar';
import i18n from '@dhis2/d2-i18n';

import './App.css';

class App extends Component {
  getChildContext() {
      return {
          d2: this.props.d2,
      };
  }

  render() {
    const { d2 } = this.props;

    return (
      <div className="main">
        <HeaderBar d2={d2} />
        <div className="welcome">{i18n.t("Hello there")}</div>
      </div>
    );
  }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

App.propTypes = {
    d2: PropTypes.object.isRequired,
};

export default App;
