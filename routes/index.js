const routes = module.exports = require('http-hash')()

routes.set('/', (request, response) => {
  response.statusCode = 303
  response.setHeader('Location', process.env.REDIRECT)
  response.end()
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
