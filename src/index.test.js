import { describe, test } from '@jest/globals'
import assert from 'assert'
import createError from 'axios/lib/core/createError'
import createInterceptor from './index'

describe('createInterceptor()', () => {
  test('is a function', () => {
    assert.strictEqual(typeof createInterceptor, 'function')
  })

  describe('returns retryErrorInterceptor()', () => {
    test('retries HTTP 429 errors after waiting Retry-After seconds', async () => {
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
