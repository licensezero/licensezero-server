module.exports = require('./simple-get')(
  'offerID',
  require('../schemas').validate.id,
  require('../data/read-offer')
)
