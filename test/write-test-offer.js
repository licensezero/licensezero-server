const offer = require('./offer')
const fs = require('fs')
const offerPath = require('../data/paths/offer')
const path = require('path')
const runSeries = require('run-series')

module.exports = callback => {
  const file = offerPath(offer.id)
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      fs.writeFile(file, JSON.stringify(offer.data), done)
    }
  ], callback)
}
