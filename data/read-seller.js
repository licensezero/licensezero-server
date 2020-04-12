const sellerPath = require('./paths/seller')
const fs = require('fs')
const parseJSON = require('json-parse-errback')
const runWaterfall = require('run-waterfall')
const errorTestID = require('./error-test-id')

module.exports = process.env.NODE_ENV === 'test'
  ? (sellerID, callback) => {
    if (sellerID === errorTestID) {
      return callback(new Error('test read error'))
    }
    read(sellerID, callback)
  }
  : /* istanbul ignore next */ read

function read (sellerID, callback) {
  runWaterfall([
    fs.readFile.bind(fs, sellerPath(sellerID)),
    parseJSON
  ], callback)
}
