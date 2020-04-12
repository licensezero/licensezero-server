const offerPath = require('./paths/offer')
const fs = require('fs')
const parseJSON = require('json-parse-errback')
const runWaterfall = require('run-waterfall')
const errorTestID = require('./error-test-id')

module.exports = process.env.NODE_ENV === 'test'
  ? (offerID, callback) => {
    if (offerID === errorTestID) {
      return callback(new Error('test read error'))
    }
    read(offerID, callback)
  }
  : /* istanbul ignore next */ read

function read (offerID, callback) {
  runWaterfall([
    fs.readFile.bind(fs, offerPath(offerID)),
    parseJSON
  ], callback)
}
