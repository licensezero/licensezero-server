const seller = require('./seller')
const fs = require('fs')
const sellerPath = require('../data/paths/seller')
const path = require('path')
const runSeries = require('run-series')

module.exports = callback => {
  const file = sellerPath(seller.id)
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      fs.writeFile(file, JSON.stringify(seller.data), done)
    }
  ], callback)
}
