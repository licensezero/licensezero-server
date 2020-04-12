const errorTestID = require('./error-test-id')
const fs = require('fs')
const parseJSON = require('json-parse-errback')
const paths = require('./paths')
const runWaterfall = require('run-waterfall')

const singletons = ['broker']
singletons.forEach(name => {
  exports[name] = readSingleton(paths[name])
})

function readSingleton (pathFunction) {
  return callback => {
    runWaterfall([
      fs.readFile.bind(fs, pathFunction()),
      parseJSON
    ], callback)
  }
}

const byID = ['bundle', 'offer', 'order', 'receipt', 'seller']
byID.forEach(name => {
  exports[name] = readByID(paths[name])
})

function readByID (pathFunction) {
  return process.env.NODE_ENV === 'test'
    ? (id, callback) => {
      if (id === errorTestID) {
        return callback(new Error('test read error'))
      }
      read(id, callback)
    }
    : /* istanbul ignore next */ read

  function read (id, callback) {
    runWaterfall([
      fs.readFile.bind(fs, pathFunction(id)),
      parseJSON
    ], callback)
  }
}
