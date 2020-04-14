const dirname = require('path').dirname
const enforce = require('../policy/enforce')
const fs = require('fs')
const paths = require('../data/paths')
const pino = require('pino')
const server = require('./server')
const tape = require('tape')
const uuid = require('uuid')

const sellerID = uuid.v4()
const url = 'https://example.com/project'

testError('site offer', {
  sellerID,
  pricing: {
    site: { // Issue here.
      currency: 'USD',
      amount: 1000
    }
  },
  url
}, (error, test) => {
  test.assert(error.message.includes('single'), 'single')
})

testError('EUR offer', {
  sellerID,
  pricing: {
    single: {
      currency: 'EUR', // Issue here.
      amount: 1000
    }
  },
  url
}, (error, test) => {
  test.assert(error.message.includes('EUR'), 'EUR')
})

testError('invalid offer', { invalid: 'offer' }, (error, test) => {
  test.assert(error.message.includes('not a valid'), 'not a valid')
})

testError('valid offer', require('./offer').data, (error, test) => {
  test.ifError(error, 'no policy error')
})

function testError (label, offer, handler) {
  tape(`policy: ${label}`, test => {
    server((port, close) => {
      const offerID = uuid.v4()
      const file = paths.offer(offerID)
      fs.mkdir(dirname(file), { recursive: true }, error => {
        test.ifError(error, 'no mkdir error')
        fs.writeFile(
          file,
          JSON.stringify(offer),
          error => {
            test.ifError(error, 'no write error')
            const log = pino({}, fs.createWriteStream('/dev/null'))
            enforce(log, error => {
              handler(error, test)
              test.end()
              close()
            })
          }
        )
      })
    })
  })
}
