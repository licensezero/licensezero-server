const http = require('http')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')

const version = require('../package.json').version
const path = '/version'

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path }, response => {
      test.equal(response.statusCode, 200, '200')
      simpleConcat(response, (_, buffer) => {
        test.equal(buffer.toString(), version, version)
        test.end()
        close()
      })
    }).end()
  })
})
