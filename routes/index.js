const routes = module.exports = require('http-hash')()

routes.set('/', (request, response) => {
  response.statusCode = 303
  response.setHeader('Location', process.env.REDIRECT)
  response.end()
})

const version = require('../package.json').version

routes.set('/version', (request, response) => {
  response.setHeader('Content-Type', 'text/plain')
  response.end(version)
})

routes.set('/robots.txt', (request, response) => {
  response.setHeader('Content-Type', 'text/plain')
  response.end('User-Agent: *\nDisallow: /\n')
})

// test/internal-error.test.js uses this route to
// ttest handling of hrown errors and to cover
// trouter/internal-error.js.
routes.set('/internal-error', (request, response) => {
  throw new Error('internal error for testing')
})

routes.set('/broker', require('./broker'))

routes.set('/sellers/:sellerID', require('./sellers'))

routes.set('/offers/:offerID', require('./offers'))
