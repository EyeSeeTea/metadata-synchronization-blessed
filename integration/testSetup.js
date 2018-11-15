import { setDefaultOptions } from 'expect-puppeteer'

jest.setTimeout(process.env.JEST_TIMEOUT || 30 * 1000)

setDefaultOptions({ timeout: 1000 })
