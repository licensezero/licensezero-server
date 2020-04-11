const http = require('http')
const server = require('./server')
const tape = require('tape')

const path = '/internal-error'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 500, '500')
      test.end()
      close()
    }).end()
  })
})
