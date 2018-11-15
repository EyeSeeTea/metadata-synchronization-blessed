import expect from 'expect-puppeteer'

import { initDhis2App } from '../src/utils/testing'

let app

describe('Dhis App Skeleton App', () => {
    beforeAll(async () => {
        app = await initDhis2App('/', {
            auth: { username: 'test', password: 'Test123$' },
            userAttributes: {
                email: 'myemail@server.org',
                userCredentials: {
                    userRoles: [{ id: 'xJZBzAHI88H' }],
                },
            },
            setup: async ({ d2Admin, apiAdmin }) => {
                // Use d2/d2Admin (user system) for extra setup on the Dhis2 instance before
                // the app page is loaded
            },
        })
    })

    describe('When user clicks button', () => {
        beforeAll(async () => {
            await expect(app.page).toClick('button', {
                text: 'Click to show feedback',
            })
        })

        it('opens feedback with a welcome text', async () => {
            await expect(app.page).toMatch('Hello there')
            // To stop the browser and see what's going on
        })
    })
})
