const sellersPath = require('./sellers')
const path = require('path')

module.exports = id => path.join(sellersPath(), id, 'seller.json')
