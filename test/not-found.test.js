const http = require('http')
const server = require('./server')
const tape = require('tape')

const path = '/nonexistent'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, (response) => {
      test.equal(response.statusCode, 404, '404')
      test.end()
      close()
    }).end()
  })
})
