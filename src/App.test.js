import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const d2 = {};
  ReactDOM.render(<App d2={d2} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
