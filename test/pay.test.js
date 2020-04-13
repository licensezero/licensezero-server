const FormData = require('form-data')
const formatUSD = require('../util/format-usd')
const http = require('http')
const offer = require('./offer')
const runSeries = require('run-series')
const seller = require('./seller')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const uuid = require('uuid')
const writeTestOffer = require('./write-test-offer')
const writeTestSeller = require('./write-test-seller')

tape('GET /pay?orderID={valid}', test => {
  server((port, close) => {
    let location
    const name = 'Joe Licensee'
    const email = 'joe@exmaple.com'
    const jurisdiction = 'US-TX'
    runSeries([
      writeTestSeller,
      writeTestOffer,
      done => {
        const form = new FormData()
        form.append('name', name)
        form.append('email', email)
        form.append('jurisdiction', jurisdiction)
        form.append('offerIDs[]', offer.id)
        const request = http.request({
          port,
          path: '/order',
          method: 'POST',
          headers: form.getHeaders()
        }, response => {
          test.equal(response.statusCode, 303, '303')
          location = response.headers.location
          done()
        })
        form.pipe(request)
      },
      done => {
        http.request({ port, path: location }, response => {
          simpleConcat(response, (error, buffer) => {
            test.ifError(error, 'no concat error')
            const body = buffer.toString()
            // Buyer
            test.assert(body.includes(name), 'name')
            test.assert(body.includes(email), 'email')
            test.assert(body.includes(jurisdiction), 'jurisdiction')
            // Offer
            test.assert(body.includes(offer.id), 'offerID')
            test.assert(body.includes(offer.data.url), 'offer URL')
            test.assert(body.includes(formatUSD(offer.data.pricing.single.amount)), 'offer price')
            // Seller
            test.assert(body.includes(seller.data.name), 'seller name')
            test.assert(body.includes(seller.data.jurisdiction), 'seller jurisdiction')
            // Total
            const total = `<span class="price total">${formatUSD(offer.data.pricing.single.amount)}</span>`
            test.assert(body.includes(total), 'total')
            done()
          })
        }).end()
      }
    ], error => {
      test.ifError(error, 'no error')
      test.end()
      close()
    })
  })
})

tape('GET /pay?orderID={invalid}', test => {
  server((port, close) => {
    const orderID = uuid.v4()
    const path = '/pay?orderID=' + orderID
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 400, '400')
      simpleConcat(response, (error, buffer) => {
        test.ifError(error, 'no concat error')
        const body = buffer.toString()
        test.equal(response.headers['content-type'], 'text/html')
        test.assert(body.includes('Not Found'), 'Not Found')
        test.end()
        close()
      })
    }).end()
  })
})
