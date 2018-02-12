/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import ReactDOM from 'react-dom';
import Application from 'core/Application';
import * as Environment from 'core/Environment';
import App from 'components/App';

const app = new Application();

export function start() {
    ReactDOM.render(
        <App app={app} />,
        document.getElementById('app'),
    );
}

export const env = {};

if (process.env.NODE_ENV !== 'production') {
    Object.assign(env, Environment);
}

/* webpack */
require('../styles/index.less');
require('../html/index.html');

require.context('../images/browser/controls', false, /\.(jpg|png|gif)$/);
