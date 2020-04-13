const http = require('http')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')

const path = '/terms/license'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 200, '200')
      simpleConcat(response, (error, buffer) => {
        test.ifError(error, 'no concat error')
        const body = buffer.toString()
        test.assert(body.includes('<h1>License Zero Private License'), '<h1>')
        test.assert(body.includes('joe@example.com'), 'joe@example.com')
        test.assert(body.includes('jane@example.com'), 'jane@example.com')
        test.end()
        close()
      })
    }).end()
  })
})
