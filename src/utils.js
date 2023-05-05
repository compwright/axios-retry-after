export function isRetryable (error) {
  return !!(
    // must be a response error
    error.response &&
    // must be a rate limit error
    error.response.status === 429 &&
    // must have a Retry-After header
    error.response.headers['retry-after']
  )
}

export function wait (error) {
  const retryAfter = error.response.headers['retry-after']

  let timeToWait
  // If Retry-After is a non-negative decimal integer indicating the seconds
  // to delay after the response is received
  if (Number.isInteger(parseInt(retryAfter))) {
    timeToWait = parseInt(retryAfter) * 1000
  } else {
    // If Retry-After is a date after which to retry
    timeToWait = parseInt(new Date(retryAfter).getTime() - new Date(Date.now()).getTime())
  }
  return new Promise(
    resolve => setTimeout(resolve, timeToWait)
  )
}

export function retry (axios, error) {
  if (!error.config) {
    throw error
  } else {
    return axios(error.config)
  }
}
