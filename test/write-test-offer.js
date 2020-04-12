const offer = require('./offer')
const fs = require('fs')
const paths = require('../data/paths')
const path = require('path')
const runSeries = require('run-series')

module.exports = callback => {
  const file = paths.offer(offer.id)
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      fs.writeFile(file, JSON.stringify(offer.data), done)
    }
  ], callback)
}
