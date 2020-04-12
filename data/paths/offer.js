const offersPath = require('./offers')
const path = require('path')

module.exports = id => path.join(offersPath(), id, 'offer.json')
