'use strict';

function isRetryable(error) {
  return !!// must be a response error
  (error.response && // must be a rate limit error
  error.response.status === 429 && // must have a Retry-After header
  error.response.headers["retry-after"]);
}
function wait(error) {
  const retryAfter = error.response.headers["retry-after"];
  let timeToWait;
  if (Number.isInteger(parseInt(retryAfter))) {
    timeToWait = parseInt(retryAfter) * 1e3;
  } else {
    timeToWait = parseInt(new Date(retryAfter).getTime() - new Date(Date.now()).getTime());
  }
  return new Promise(
    (resolve) => setTimeout(resolve, timeToWait)
  );
}
function retry(axios, error) {
  if (!error.config) {
    throw error;
  } else {
    return axios(error.config);
  }
}

const utils = {
  __proto__: null,
  isRetryable: isRetryable,
  retry: retry,
  wait: wait
};

function index(axios, options = {}) {
  const { isRetryable, wait, retry } = { ...utils, ...options };
  return async function(error) {
    if (isRetryable(error)) {
      await wait(error);
      return retry(axios, error);
    } else {
      throw error;
    }
  };
}

module.exports = index;
