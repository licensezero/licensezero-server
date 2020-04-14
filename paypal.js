const amountToValue = require('./util/amount-to-value')
const https = require('https')
const simpleConcatLimit = require('simple-concat-limit')

const host = process.env.NODE_ENV === 'test'
  ? 'https://api.sandbox.paypal.com'
  : 'https://api.paypal.com'

module.exports = {
  captureOrder,
  createOrder,
  getToken,
  verifyNotification
}

function getToken (callback) {
  let failed = false
  https.request({
    host,
    path: '/v1/oauth2/token',
    method: 'POST',
    auth: `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en_US'
    }
  })
    .once('error', error => { fail(error) })
    .once('response', response => {
      if (failed) return
      simpleConcatLimit(response, 512, (error, buffer) => {
        if (failed) return
        if (error) return fail(error)
        let data
        try {
          data = JSON.parse(buffer)
        } catch (error) {
          return fail(error)
        }
        const token = data.access_token
        if (typeof token !== 'string' || token.length === 0) {
          return fail(new Error('invalid token'))
        }
        callback(null, token)
      })
    })
    .end('grant_type=client_credentials')

  function fail (error) {
    if (failed) return
    failed = true
    callback(error)
  }
}

function createOrder ({ orderID, order, offers }, callback) {
  let failed = false
  const purchaseUnits = offers.map(offer => {
    const single = offer.offer.pricing.single
    return {
      custom_id: offer.id,
      invoice_id: orderID,
      items: {
        name: 'software license',
        sku: offer.id
      },
      payer: {
        email: order.email
      },
      amount: {
        currency_code: single.currency,
        value: amountToValue(single.amount)
      }
    }
  })
  getToken((error, token) => {
    if (error) return callback(error)
    https.request({
      host,
      path: '/v2/checkout/orders',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .once('error', error => { fail(error) })
      .once('response', response => {
        if (failed) return
        if (response.statusCode !== 201) {
          return fail(new Error('PayPal responded ' + response.statusCode))
        }
        simpleConcatLimit(response, 1024, (error, buffer) => {
          if (failed) return
          if (error) return fail(error)
          let data
          try {
            data = JSON.parse(buffer)
          } catch (error) {
            return fail(error)
          }
          callback(null, {
            id: data.id,
            status: data.status.toLowerCase()
          })
        })
      })
      .end(JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: purchaseUnits
      }))
  })

  function fail (error) {
    if (failed) return
    failed = true
    callback(error)
  }
}

function captureOrder (payPalID, callback) {
  let failed = false
  getToken((error, token) => {
    if (error) return callback(error)
    https.request({
      host,
      path: `/v2/checkout/orders/${payPalID}/capture`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .once('error', error => {
        fail(error)
      })
      .once('response', response => {
        if (failed) return
        if (response.statusCode !== 201) {
          return fail(new Error('PayPal responded ' + response.statusCode))
        }
        callback()
      })
      .end()
  })

  function fail (error) {
    if (failed) return
    failed = true
    callback(error)
  }
}

function verifyNotification ({ headers, body }, callback) {
  let failed = false
  getToken((error, token) => {
    if (error) return callback(error)
    https.request({
      host,
      path: '/v1/notifications/verify-webhook-signature',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .once('error', error => { fail(error) })
      .once('response', response => {
        if (failed) return
        if (response.statusCode !== 200) {
          return fail(new Error('PayPal responded ' + response.statusCode))
        }
        simpleConcatLimit(response, 512, (error, buffer) => {
          if (failed) return
          if (error) return fail(error)
          let data
          try {
            data = JSON.parse(buffer)
          } catch (error) {
            return fail(error)
          }
          callback(null, data.verification_status === 'SUCCESS')
        })
      })
      .end(JSON.stringify({
        transmission_id: headers['PAYPAL-TRANSMISSION-ID'],
        transmission_time: headers['PAYPAL-TRANSMISSION-TIME'],
        transmission_sig: headers['PAYPAL-TRANSMISSION-SIG'],
        cert_url: headers['PAYPAL-CERT-URL'],
        webhook_id: process.env.PAYPAL_WEBHOOK_ID,
        webhook_event: body
      }))
  })

  function fail (error) {
    if (failed) return
    failed = true
    callback(error)
  }
}
