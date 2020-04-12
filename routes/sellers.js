module.exports = require('./simple-get')(
  'sellerID',
  require('../schemas').validate.id,
  require('../data/read-seller')
)
