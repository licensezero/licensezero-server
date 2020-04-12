const doNotCache = require('do-not-cache')
const internalError = require('./internal-error')
const notFound = require('./not-found')

module.exports = read => {
  return (request, response) => {
    doNotCache(response)
    if (request.method !== 'GET') {
      response.statusCode = 405
      return response.end()
    }
    read((error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return notFound(request, response)
        } else {
          return internalError(request, response, error)
        }
      }
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify(data))
    })
  }
}
