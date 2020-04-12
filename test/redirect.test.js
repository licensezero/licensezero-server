const http = require('http')
const server = require('./server')
const tape = require('tape')

const path = '/'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 303, '303')
      test.equal(response.headers.location, 'http://example.com', 'Location')
      test.end()
      close()
    }).end()
  })
})
