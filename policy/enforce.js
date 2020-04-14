const fs = require('fs')
const paths = require('../data/paths')
const runParallelLimit = require('run-parallel-limit')
const schemas = require('../schemas')
const checkOffer = require('./check-offer')

const LIMIT = 3

module.exports = (log, callback) => {
  const offers = paths.offers()
  fs.readdir(offers, (error, entries) => {
    if (error) {
      if (error.code === 'ENOENT') {
        return fs.mkdir(offers, { recursive: true }, (error) => {
          if (error) return callback(error)
        })
      }
      return callback(error)
    }
    runParallelLimit(entries.map(entry => {
      return done => {
        const file = paths.offer(entry)
        fs.readFile(file, (error, buffer) => {
          if (error) return done(error)
          let offer
          try {
            offer = JSON.parse(buffer)
          } catch (error) {
            return done(error)
          }
          if (!schemas.validate.offer(offer)) {
            return done(new Error(`${file} not a valid offer.`))
          }
          checkOffer(offer, (error, issues) => {
            if (error) return done(error)
            if (issues.length !== 0) {
              return done(new Error(`${file}: ${issues.join(' ')}`))
            }
            return done()
          })
        })
      }
    }), LIMIT, callback)
  })
}
