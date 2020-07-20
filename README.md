# axios-retry-after

[![Build Status](https://travis-ci.org/compwright/axios-retry-after.png?branch=master)](https://travis-ci.org/compwright/axios-retry-after)
[![Dependency Status](https://img.shields.io/david/compwright/axios-retry-after.svg?style=flat-square)](https://david-dm.org/compwright/axios-retry-after)
[![Download Status](https://img.shields.io/npm/dm/axios-retry-after.svg?style=flat-square)](https://www.npmjs.com/package/axios-retry-after)

A tiny HTTP retry interceptor for [axios](https://www.npmjs.com/package/axios).

This interceptor catches HTTP 429 errors, reads the `Retry-After` header, and retries the request at the proper type.

## Installation

```bash
npm install --save axios-retry-after
```

## Example usage

```javascript
const axios = require('axios')
const retry = require('axios-retry-after')
const client = axios.createClient()
client.interceptors.response.use(null, retry(client))
```

## Customizing retry behavior

You can optionally customize the behavior of this interceptor by passing a second argument including one or more of the methods demonstrated below:

```javascript
client.interceptors.response.use(null, retry(client, {
  // Determine when we should attempt to retry
  isRetryable (error) {
    return (
      error.response && error.response.status === 429 &&
      // Use X-Retry-After rather than Retry-After, and cap retry delay at 60 seconds
      error.response.headers['x-retry-after'] && error.response.headers['x-retry-after'] <= 60
    )
  }

  // Customize the wait behavior
  wait (error) {
    return new Promise(
      // Use X-Retry-After rather than Retry-After 
      resolve => setTimeout(resolve, error.response.headers['x-retry-after'])
    )
  }

  // Customize the retry request itself
  retry (axios, error) {
    if (!error.config) {
      throw error
    }

    // Apply request customizations before retrying
    // ...

    return axios(error.config)
  }
}))
```
