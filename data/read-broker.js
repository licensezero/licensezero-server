const brokerPath = require('./paths/broker')
const fs = require('fs')
const parseJSON = require('json-parse-errback')
const runWaterfall = require('run-waterfall')

module.exports = callback => {
  runWaterfall([
    fs.readFile.bind(fs, brokerPath()),
    parseJSON
  ], callback)
}
