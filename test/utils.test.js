const assert = require('assert')
const createError = require('axios/lib/core/createError')

const { isRetryable, wait, retry } = require('../src/utils')

function mockRequestError (message) {
  return createError(message, {}, null, {})
}

function mockResponseError (message, response = {}) {
  return createError(message, {}, null, {}, response)
}

describe('utils', () => {
  describe('isRetryable()', () => {
    it('returns false when given a Javascript error', () => {
      assert.strictEqual(isRetryable(new Error()), false)
    })

    it('returns false when given a request error', () => {
      assert.strictEqual(isRetryable(mockRequestError('Request error')), false)
    })

    it('returns false when given a response error other than HTTP 429', () => {
      assert.strictEqual(isRetryable(mockResponseError('HTTP 400 Bad Request', { status: 400 })), false)
      assert.strictEqual(isRetryable(mockResponseError('HTTP 401 Unauthorized', { status: 401 })), false)
      assert.strictEqual(isRetryable(mockResponseError('HTTP 403 Forbidden', { status: 403 })), false)
      assert.strictEqual(isRetryable(mockResponseError('HTTP 404 Not Found', { status: 404 })), false)
      assert.strictEqual(isRetryable(mockResponseError('HTTP 500 Server Error', { status: 500 })), false)
    })

    it('returns false when given a HTTP 429 error without the Retry-After header', () => {
      assert.strictEqual(isRetryable(mockResponseError('HTTP 429 Rate Limit Exceeded', { headers: {}, status: 429 })), false)
    })

    it('returns true when given a HTTP 429 error with the Retry-After header', () => {
      const error = mockResponseError('HTTP 429 Rate Limit Exceeded', {
        status: 429,
        headers: {
          ['retry-after']: 25
        }
      })
      assert.strictEqual(isRetryable(error), true)
    })
  })

  describe('wait', () => {
    it('returns a promise', () => {
      const error = mockResponseError('HTTP 429 Rate Limit Exceeded', {
        headers: {
          ['retry-after']: 1
        }
      })

      const promise = wait(error)
      assert(promise.then)
      return promise
    })

    it('waits the number of seconds specified in the Retry-After header', (done) => {
      const error = mockResponseError('HTTP 429 Rate Limit Exceeded', {
        headers: {
          ['retry-after']: 2
        }
      })

      const timeout = setTimeout(() => {
        done(new Error('Timeout reached before wait resolved'))
      }, 4)

      Promise.resolve(wait(error))
        .then(() => {
          clearTimeout(timeout)
          done()
        })
        .catch(done)
    })
  })

  describe('retry', () => {
    it('retries the request', (done) => {
      const error = mockResponseError('HTTP 429 Rate Limit Exceeded')

      error.config = {
        method: 'POST',
        url: '/'
      }

      const mockAxios = (config) => {
        assert.deepStrictEqual(config, error.config)
        done()
      }

      retry(mockAxios, error)
    })

    it('re-throws the error if config is not present', () => {
      const error = new Error('Foobar')
      assert.throws(() => {
        retry(() => {}, error)
      }, error)
    })
  })
})
