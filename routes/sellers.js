module.exports = require('./get-by-id')(
  'sellerID',
  require('../schemas').validate.id,
  require('../data/read-seller')
)
