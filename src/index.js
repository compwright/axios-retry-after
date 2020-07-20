const utils = require('./utils')

module.exports = function (axios, options = {}) {
  const { isRetryable, wait, retry } = { ...utils, ...options }

  return async function (error) {
    if (isRetryable(error)) {
      await wait(error)
      return retry(axios, error)
    } else {
      throw error
    }
  }
}
