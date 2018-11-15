import React from 'react'
import { shallow } from 'enzyme'
import HeaderBar from '@dhis2/d2-ui-header-bar'

import { getD2Stub } from '../utils/testing'
import App from '../App.component'

const appConfig = {
    "appearance": {
        "showShareButton": true
    },
}

function render({ props } = {}) {
    const fullProps = { d2: getD2Stub(), appConfig, ...props }
    return shallow(<App {...fullProps} />)
}

describe('App', () => {
    it('renders the header bar', () => {
        const component = render()
        expect(component.find(HeaderBar)).toHaveLength(1)
    })
})
