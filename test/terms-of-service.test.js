const http = require('http')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const writeTestTermsOfService = require('./write-test-terms-of-service')

const path = '/terms/service'

tape(`GET ${path}`, test => {
  server((port, close) => {
    writeTestTermsOfService(_ => {
      http.request({ port, path }, response => {
        test.equal(response.statusCode, 200, '200')
        test.equal(response.headers['content-type'], 'text/html', 'text/html')
        simpleConcat(response, (_, buffer) => {
          const html = buffer.toString()
          const title = '<title>Terms of Service</title>'
          test.assert(html.includes(title), 'serves HTML with <title>')
          test.end()
          close()
        })
      }).end()
    })
  })
})

tape(`GET ${path} nonexistent`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 404, '404')
      test.end()
      close()
    }).end()
  })
})

tape(`POST ${path}`, test => {
  server((port, close) => {
    http.request({ port, path, method: 'POST' }, response => {
      test.equal(response.statusCode, 405, '405')
      test.end()
      close()
    }).end()
  })
})
