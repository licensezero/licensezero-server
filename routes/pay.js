const amountToValue = require('../util/amount-to-value')
const checkOfferIDs = require('../util/check-offer-ids')
const doNotCache = require('do-not-cache')
const ejs = require('ejs')
const expired = require('../data/expired')
const formatUSD = require('../util/format-usd')
const fs = require('fs')
const internalError = require('./internal-error')
const path = require('path')
const querystring = require('querystring')
const read = require('../data/read')
const runAuto = require('run-auto')
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
        },

        sellerIDs: ['offers', (results, done) => {
          const sellerIDs = []
          results.offers.forEach(offer => {
            const sellerID = offer.sellerID
            if (!sellerIDs.includes(sellerID)) {
              sellerIDs.push(sellerID)
            }
          })
          done(null, sellerIDs)
        }],

        sellers: ['offers', 'sellerIDs', (results, done) => {
          runParallelLimit(results.sellerIDs.map(sellerID => {
            return done => {
              read.seller(sellerID, (error, seller) => {
                if (error) return done(error)
                seller.sellerID = sellerID
                done(null, seller)
              })
            }
          }), 3, (error, sellers) => {
            if (error) return done(error)
            // Add sellers to their offers.
            results.offers.forEach(offer => {
              offer.seller = sellers.find(seller => {
                return seller.sellerID === offer.sellerID
              })
            })
            done(null, sellers)
          })
        }],

        broker: done => {
          read.broker((error, broker) => {
            if (error && error.code !== 'ENOENT') {
              return done(error)
            }
            done(null, broker)
          })
        },

        total: ['offers', (results, done) => {
          let amount = 0
          results.offers.forEach(offer => {
            const single = offer.pricing.single
            if (single.currency === 'USD') {
              amount += single.amount
            }
          })
          done(null, {
            amount,
            formatted: formatUSD(amount)
          })
        }],
        javascript: done => {
          fs.readFile(
            path.join(__dirname, '..', 'client', 'paypal-buttons.js'),
            'utf8',
            done
          )
        }
      }, (error, results) => {
        if (error) return internalError(request, response, error)

        const orderData = {
          purchase_units: [
            {
              amount: {
                value: amountToValue(results.total)
              }
            }
          ]
        }
        const src = 'https://www.paypal.com/sdk/js?' + querystring.stringify({
          'client-id': process.env.PAYPAL_CLIENT_ID,
          commit: 'false', // Show "Pay Now", not "Continue".
          components: [
            'buttons',
            'funding-eligibility' // For limiting to credit cards.
          ].join(','),
          currency: 'USD',
          intent: 'capture',
          vault: 'false',
          'integration-date': '2020-04-14'
        })
        const paymentUI = `
<div id="paypal-playpen"></div>
<script src="${src}"></script>
<script>
var orderData = ${JSON.stringify(orderData)}
${results.javascript}
</script>
        `.trim()

        render({
          request,
          response,
          read: read.payTemplate,
          data: {
            broker: results.broker,
            order,
            orderID,
            offers: results.offers,
            total: results.total,
            paymentUI
          }
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
