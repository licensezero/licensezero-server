const http = require('http')
const broker = require('./broker')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const writeTestBroker = require('./write-test-broker')

const path = '/broker'

tape(`GET ${path}`, test => {
  server((port, close) => {
    writeTestBroker(_ => {
      http.request({ port, path }, response => {
        test.equal(response.statusCode, 200, '200')
        test.equal(response.headers['content-type'], 'application/json', 'application/json')
        simpleConcat(response, (error, buffer) => {
          test.ifError(error, 'no body read error')
          test.deepEqual(JSON.parse(buffer), broker, 'broker JSON')
          test.end()
          close()
        })
      }).end()
    })
  })
})

tape(`GET ${path} with none`, test => {
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
