const doNotCache = require('do-not-cache')
const ejs = require('ejs')
const internalError = require('./internal-error')
const read = require('../data/read')
const renderMarkdown = require('../util/render-markdown')
const runParallel = require('run-parallel')
const uuid = require('uuid')

module.exports = (request, response) => {
  doNotCache(response)
  runParallel({
    licenseTermsTemplate: done => {
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
    },

    licensePageTemplate: done => {
      read.licensePageTemplate(done)
    }
  }, (error, results) => {
    if (error) return internalError(request, response, error)

    let markdown
    try {
      markdown = ejs.render(results.licenseTermsTemplate, {
        date: new Date().toISOString(),
        seller: {
          name: 'Joe Seller',
          jurisdiction: 'US-CA',
          email: 'joe@example.com',
          url: 'https://example.com/~seller'
        },
        broker: results.broker,
        buyer: {
          name: 'Jane Buyer',
          jurisdiction: 'US-TX',
          email: 'jane@example.com',
          url: 'https://example.com/~buyer'
        },
        offerID: uuid.v4(),
        offer: {
          url: 'https://example.com/project'
        }
      })
    } catch (error) {
      return internalError(request, response, error)
    }

    let content
    try {
      content = renderMarkdown(markdown)
    } catch (error) {
      return internalError(request, response, error)
    }

    let html
    try {
      html = ejs.render(results.licensePageTemplate, { content })
    } catch (error) {
      return internalError(request, response, error)
    }

    response.setHeader('Content-Type', 'text/html')
    response.end(html)
  })
}
