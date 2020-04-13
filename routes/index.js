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
// test handling of hrown errors and to cover
// trouter/internal-error.js.
routes.set('/internal-error', (request, response) => {
  throw new Error('internal error for testing')
})

routes.set('/broker', require('./broker'))

const schemas = require('../schemas')
const getByID = require('./get-by-id')
const read = require('../data/read')

const byID = ['seller', 'offer', 'receipt', 'bundle', 'order']
byID.forEach(singular => {
  const plural = singular + 's'
  const parameter = singular + 'ID'
  routes.set(
    `/${plural}/:${parameter}`,
    getByID(
      parameter,
      schemas.validate.id,
      read[singular],
      singular === 'order'
        ? record => record.order
        : false
    )
  )
})

routes.set('/terms/service', require('./terms-of-service'))

routes.set('/terms/brokerage', require('./brokerage-terms'))

routes.set('/terms/license', require('./license-terms'))

routes.set('/order', require('./order'))

routes.set('/pay', require('./pay'))
