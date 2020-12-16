const assert = require('assert')
const createError = require('axios/lib/core/createError')
const createInterceptor = require('../src')

describe('createInterceptor()', () => {
  it('is a function', () => {
    assert.strictEqual(typeof createInterceptor, 'function')
  })

  describe('returns retryErrorInterceptor()', () => {
    it('retries HTTP 429 errors after waiting Retry-After seconds', async () => {
      const error = createError('HTTP 429 Rate Limit Exceeded', {}, null, {}, {
        status: 429,
        headers: {
          'retry-after': 2
        }
      })

      const response = { success: true }

      async function mockAxios () {
        return response
      }

      const retryErrorInterceptor = createInterceptor(mockAxios)
      assert.strictEqual(typeof retryErrorInterceptor, 'function')

      const retryResponse = await retryErrorInterceptor(error)
      assert.deepStrictEqual(retryResponse, response)
    })
  })
})
