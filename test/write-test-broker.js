const broker = require('./broker')
const brokerPath = require('../data/paths/broker')
const fs = require('fs')
const path = require('path')
const runSeries = require('run-series')

module.exports = callback => {
  const file = brokerPath()
  runSeries([
    done => {
      fs.mkdir(path.dirname(file), { recursive: true }, done)
    },
    done => {
      fs.writeFile(file, JSON.stringify(broker), done)
    }
  ], callback)
}
