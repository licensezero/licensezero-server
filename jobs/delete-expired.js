const expired = require('../data/expired')
const fs = require('fs')
const path = require('path')
const runParallelLimit = require('run-parallel-limit')

const LIMIT = 3

module.exports = (pathFunction) => {
  return (serverLog, callback) => {
    var directory = pathFunction()
    var log = serverLog.child({ subsystem: 'sweep', directory })
    fs.readdir(directory, (error, entries) => {
      if (error) {
        log.error(error)
        return callback(error)
      }
      runParallelLimit(entries.map((entry) => {
        return function (done) {
          var file = path.join(directory, entry)
          fs.readFile(file, (error, buffer) => {
            if (error) {
              log.error(error)
              return done()
            }
            let order
            try {
              order = JSON.parse(buffer)
            } catch (error) {
              return callback(error)
            }
            if (!expired(order.created)) return done()
            var dataToLog = { order: order.orderID, file }
            log.info(dataToLog, 'expired')
            fs.unlink(file, (error) => {
              if (error) log.error(error)
              log.info(dataToLog, 'deleted')
              done()
            })
          })
        }
      }), LIMIT, (error) => {
        log.info('done')
        callback(error)
      })
    })
  }
}
