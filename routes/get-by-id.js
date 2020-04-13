const doNotCache = require('do-not-cache')
const internalError = require('./internal-error')
const notFound = require('./not-found')

module.exports = (parameter, validate, read, unwrap) => {
  return (request, response) => {
    doNotCache(response)
    if (request.method !== 'GET') {
      response.statusCode = 405
      return response.end()
    }
    const id = request.parameters[parameter]
    if (!validate(id)) {
      response.statusCode = 400
      return response.end()
    }
    read(id, (error, data) => {
      if (error) {
        if (error.code === 'ENOENT') {
          return notFound(request, response)
        } else {
          return internalError(request, response, error)
        }
      }
      response.setHeader('Content-Type', 'application/json')
      const body = unwrap ? unwrap(data) : data
      response.end(JSON.stringify(body))
    })
  }
}
