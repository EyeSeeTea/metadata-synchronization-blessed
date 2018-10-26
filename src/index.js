import React from 'react'
import ReactDOM from 'react-dom'
import { init, config, getUserSettings } from 'd2/lib/d2'

import App from './App'
import './index.css'
import i18n from './locales'

function isLangRTL(code) {
    const langs = ['ar', 'fa', 'ur']
    const prefixed = langs.map(c => `${c}-`)
    return (
        langs.includes(code) ||
        prefixed.filter(c => code.startsWith(c)).length > 0
    )
}

function configI18n(userSettings) {
    const uiLocale = userSettings.keyUiLocale

    if (uiLocale && uiLocale !== 'en') {
        config.i18n.sources.add(`./i18n/i18n_module_${uiLocale}.properties`)
    }

    config.i18n.sources.add('./i18n/i18n_module_en.properties')
    document.documentElement.setAttribute(
        'dir',
        isLangRTL(uiLocale) ? 'rtl' : 'ltr'
    )

    i18n.changeLanguage(uiLocale)
}

const envVariable = 'REACT_APP_DHIS2_URL'
const defaultServer = 'http://localhost:8080'
const baseUrl =
    (process.env[envVariable] || defaultServer).replace(/\/*$/, '') + '/api'

if (process.env.NODE_ENV === 'development')
    console.info(`DHIS2 instance: ${baseUrl}`)

init({ baseUrl })
    .then(async d2 => {
        window.d2 = d2 // Make d2 available in the console
        await getUserSettings().then(configI18n)
        ReactDOM.render(<App d2={d2} />, document.getElementById('root'))
    })
    .catch(err => console.error(err))
