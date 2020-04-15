const checkOfferIDs = require('../util/check-offer-ids')
const doNotCache = require('do-not-cache')
const expired = require('../data/expired')
const formatUSD = require('../util/format-usd')
const internalError = require('./internal-error')
const paypal = require('../paypal')
const read = require('../data/read')
const runAuto = require('run-auto')
const runParallelLimit = require('run-parallel-limit')
const schemas = require('../schemas')

module.exports = (request, response) => {
  doNotCache(response)
  if (request.method === 'POST') {
    response.statusCode = 405
    return response.end()
  }

  const orderID = request.query.orderID
  if (!schemas.validate.id(orderID)) {
    request.log.warn({ orderID }, 'invalid orderID')
    return send({ error: 'invalid orderID' })
  }

  read.order(orderID, (error, record) => {
    if (error) {
      if (error.code === 'ENOENT') {
        return send({ error: 'order not found' })
      }
      request.log.error(error)
      return send({ error: 'internal error' })
    }

    if (expired(record)) {
      request.log.warn('expired')
      return send({ error: 'order expired' })
    }

    const order = record.order
    checkOfferIDs(order, (error, missing) => {
      if (error) return internalError(request, response, error)

      if (missing.length !== 0) {
        request.log.error({ missing }, 'missing offers')
        return send({ error: 'missing offers' })
      }

      runAuto({
        offers: done => {
          const offerIDs = order['offerIDs[]']
          runParallelLimit(offerIDs.map(offerID => {
            return done => {
              read.offer(offerID, (error, offer) => {
                if (error) return done(error)
                offer.offerID = offerID
                const single = offer.pricing.single
                if (single.currency === 'USD') {
                  single.formatted = formatUSD(single.amount)
                }
                done(null, offer)
              })
            }
          }), 3, done)
        }
      }, (error, results) => {
        if (error) {
          request.log.error(error)
          return send({ error: 'internal error' })
        }

        paypal.createOrder({
          orderID, order, offers: results.offers
        }, (error, { id, status }) => {
          if (error) {
            request.log.error(error)
            return send({ error: 'internal error' })
          }

          send({ redirect: `/download/${orderID}` })
        })
      })
    })
  })

  function send (data) {
    response.setHeader('application/json')
    response.end(JSON.stringify(data))
  }
}
