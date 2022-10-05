import * as utils from './utils'

export default function (axios, options = {}) {
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
