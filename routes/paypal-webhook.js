const badRequest = require('./bad-request')
const internalError = require('./internal-error')
const paypal = require('../paypal')
const simpleConcatLimit = require('simple-concat-limit')

module.exports = (request, response) => {
  if (request.method !== 'POST') {
    response.statusCode = 405
    return response.end()
  }
  simpleConcatLimit(request, 1024, (error, buffer) => {
    if (error) return request.log.error(error)
    let body
    try {
      body = JSON.parse(buffer)
    } catch (error) {
      return badRequest(request, response)
    }
    paypal.verifyNotification({
      headers: request.headers,
      body
    }, (error, valid) => {
      if (error) return internalError(request, response, error)
      if (!valid) return badRequest(request, response)
      // CHECKOUT.ORDER.COMPLETED
    })
  })
}
