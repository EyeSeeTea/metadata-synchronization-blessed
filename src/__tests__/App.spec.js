import React from 'react'
import { shallow } from 'enzyme'
import HeaderBar from '@dhis2/d2-ui-header-bar'

import { getD2Stub } from '../config/testHelpers'
import App from '../App'

function render({ props } = {}) {
    const fullProps = { d2: getD2Stub(), ...props }
    return shallow(<App {...fullProps} />)
}

describe('App', () => {
    it('renders the header bar', () => {
        const component = render()
        expect(component.find(HeaderBar)).toHaveLength(1)
    })
})
