module.exports = require('./get-by-id')(
  'offerID',
  require('../schemas').validate.id,
  require('../data/read-offer')
)
