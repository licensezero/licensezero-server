const doNotCache = require('do-not-cache')
const fs = require('fs')
const internalError = require('./internal-error')
const notFound = require('./not-found')

module.exports = (pathFunction) => {
  return (request, response) => {
    doNotCache(response)
    if (request.method !== 'GET') {
      response.statusCode = 405
      return response.end()
    }
    fs.readFile(pathFunction(), (error, buffer) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return notFound(request, response)
        }
        return internalError(request, response, error)
      }
      response.setHeader('Content-Type', 'text/html')
      response.end(buffer)
    })
  }
}
