const internalError = require('./routes/internal-error')
const notFound = require('./routes/not-found')
const parseURL = require('url-parse')
const pinoHTTP = require('pino-http')
const routes = require('./routes')

// Given a Pino log instance, return an argument suitable
// for `http.createSerever(handler)`.
module.exports = log => {
  const pino = pinoHTTP({ logger: log })
  return (request, response) => {
    pino(request, response)
    const parsed = parseURL(request.url, true)
    request.query = parsed.query
    request.pathname = parsed.pathname
    try {
      const route = routes.get(parsed.pathname)
      if (route.handler) {
        request.parameters = route.params
        return route.handler(request, response)
      }
      notFound(request, response)
    } catch (error) {
      internalError(request, response, error)
    }
  }
}
