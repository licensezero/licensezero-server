const doNotCache = require('do-not-cache')
const ejs = require('ejs')
const internalError = require('./internal-error')
const licenseMarkdown = require('../util/license-markdown')
const read = require('../data/read')
const renderMarkdown = require('../util/render-markdown')
const runParallel = require('run-parallel')
const uuid = require('uuid')

module.exports = (request, response) => {
  doNotCache(response)

  runParallel({
    markdown: done => {
      licenseMarkdown({
        date: new Date().toISOString(),
        seller: {
          name: 'Joe Seller',
          jurisdiction: 'US-CA',
          email: 'joe@example.com',
          url: 'https://example.com/~seller'
        },
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
      }, done)
    },

    template: done => {
      read.licensePageTemplate(done)
    }
  }, (error, results) => {
    if (error) return internalError(request, response, error)

    let content
    try {
      content = renderMarkdown(results.markdown)
    } catch (error) {
      return internalError(request, response, error)
    }

    let html
    try {
      html = ejs.render(results.template, { content })
    } catch (error) {
      return internalError(request, response, error)
    }

    response.setHeader('Content-Type', 'text/html')
    response.end(html)
  })
}
