const fs = require('fs')
const path = require('path')
const paths = require('../data/paths')
const runSeries = require('run-series')
const seller = require('./seller')

module.exports = callback => {
  const file = paths.seller(seller.id)
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      fs.writeFile(file, JSON.stringify(seller.data), done)
    }
  ], callback)
}
