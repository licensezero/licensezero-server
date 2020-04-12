const uuid = require('uuid')
const seller = require('./seller')

exports.id = uuid.v4()

exports.data = {
  sellerID: seller.id,
  pricing: {
    single: {
      currency: 'USD',
      amount: 10000
    }
  },
  url: 'https://github.com/licensezero/licensezero-server'
}
