function isRetryable(error) {
  return !!(error.response && error.response.status === 429 && error.response.headers["retry-after"]);
}
function wait(error) {
  return new Promise(
    (resolve) => setTimeout(resolve, error.response.headers["retry-after"])
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
  wait: wait,
  retry: retry
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

export { index as default };
