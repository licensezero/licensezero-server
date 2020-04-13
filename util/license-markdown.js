const ejs = require('ejs')
const read = require('../data/read')
const runParallel = require('run-parallel')

module.exports = (data, callback) => {
  runParallel({
    template: done => {
      read.licenseTermsTemplate(done)
    },
    broker: done => {
      read.broker((error, broker) => {
        if (error) {
          if (error.code === 'ENOENT') {
            return done(null, null)
          }
          return done(error)
        }
        done(null, broker)
      })
    }
  }, (error, results) => {
    if (error) return callback(error)

    let markdown
    data.broker = results.broker || null
    try {
      markdown = ejs.render(results.template, data)
    } catch (error) {
      return callback(error)
    }

    callback(null, markdown)
  })
}
