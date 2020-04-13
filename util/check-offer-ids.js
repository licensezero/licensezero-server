const read = require('../data/read')
const runParallel = require('run-parallel')

module.exports = (offer, callback) => {
  const missing = []
  runParallel(
    offer['offerIDs[]'].map(offerID => {
      return done => {
        read.offer(offerID, (error, _) => {
          if (error) {
            if (error.code === 'ENOENT') {
              missing.push(offerID)
            } else {
              callback(error)
            }
          }
          done()
        })
      }
    }),
    error => {
      if (error) return callback(error)
      callback(null, missing)
    }
  )
}
