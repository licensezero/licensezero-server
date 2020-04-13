const checkOfferIDs = require('../util/check-offer-ids')
const doNotCache = require('do-not-cache')
const ejs = require('ejs')
const expired = require('../data/expired')
const formatUSD = require('../util/format-usd')
const internalError = require('./internal-error')
const read = require('../data/read')
const runParallelLimit = require('run-parallel-limit')
const schemas = require('../schemas')

module.exports = (request, response) => {
  doNotCache(response)
  const method = request.method
  if (method === 'GET') {
    return get(request, response)
  } else if (method === 'POST') {
    return post(request, response)
  }
  response.statusCode = 405
  response.end()
}

function get (request, response) {
  const orderID = request.query.orderID
  if (!schemas.validate.id(orderID)) {
    return notFound(request, response, orderID)
  }

  read.order(orderID, (error, record) => {
    if (error) {
      if (error.code === 'ENOENT') {
        return notFound(request, response, orderID)
      }
      return internalError(request, response, error)
    }

    if (expired(record)) {
      return notFound(request, response, orderID)
    }

    const order = record.order
    checkOfferIDs(order, (error, missing) => {
      if (error) return internalError(request, response, error)

      if (missing.length !== 0) {
        return render({
          request,
          response,
          read: read.invalidOfferIDs,
          data: { orderID, offerIDs: missing }
        })
      }

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
      }), 3, (error, offers) => {
        if (error) return internalError(request, response, error)
        const sellerIDs = []
        offers.forEach(offer => {
          const sellerID = offer.sellerID
          if (!sellerIDs.includes(sellerID)) {
            sellerIDs.push(sellerID)
          }
        })
        runParallelLimit(sellerIDs.map(sellerID => {
          return done => {
            read.seller(sellerID, (error, seller) => {
              if (error) return done(error)
              seller.sellerID = sellerID
              done(null, seller)
            })
          }
        }), 3, (error, sellers) => {
          if (error) return internalError(request, response, error)
          offers.forEach(offer => {
            offer.seller = sellers.find(seller => {
              return seller.sellerID === offer.sellerID
            })
          })
          read.broker((error, broker) => {
            if (error && error.code !== 'ENOENT') {
              return internalError(request, response, error)
            }
            let totalAmount = 0
            offers.forEach(offer => {
              const single = offer.pricing.single
              if (single.currency === 'USD') {
                totalAmount += single.amount
              }
            })
            const totalFormatted = formatUSD(totalAmount)
            render({
              request,
              response,
              read: read.payTemplate,
              data: {
                action: '/pay?orderID=' + orderID,
                broker,
                order,
                orderID,
                offers,
                total: {
                  amount: totalAmount,
                  formatted: totalFormatted
                },
                paymentUI: ''
              }
            })
          })
        })
      })
    })
  })
}

function notFound (request, response, orderID) {
  render({
    request,
    response,
    read: read.orderNotFoundTemplate,
    statusCode: 400,
    data: { orderID }
  })
}

function render ({ request, response, read, statusCode = 200, data }) {
  read((error, template) => {
    if (error) return internalError(request, response, error)
    let html
    try {
      html = ejs.render(template, data)
    } catch (error) {
      return internalError(request, response, error)
    }
    response.statusCode = statusCode
    response.setHeader('Content-Type', 'text/html')
    response.end(html)
  })
}

function post (request, response) {
}
