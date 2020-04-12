const http = require('http')
const seller = require('./seller')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const uuid = require('uuid')
const writeTestSeller = require('./write-test-seller')

tape('GET /sellers/{id}', test => {
  server((port, close) => {
    writeTestSeller(_ => {
      http.request({ port, path: `/sellers/${seller.id}` }, response => {
        test.equal(response.statusCode, 200, '200')
        test.equal(response.headers['content-type'], 'application/json', 'application/json')
        simpleConcat(response, (error, buffer) => {
          test.ifError(error, 'no body read error')
          test.deepEqual(JSON.parse(buffer), seller.data, 'seller JSON')
          test.end()
          close()
        })
      }).end()
    })
  })
})

tape('GET /sellers/{invalid}', test => {
  server((port, close) => {
    http.request({ port, path: '/sellers/x' }, response => {
      test.equal(response.statusCode, 400, '400')
      test.end()
      close()
    }).end()
  })
})

tape('GET /sellers/{nonexistent}', test => {
  server((port, close) => {
    const id = uuid.v4()
    http.request({ port, path: `/sellers/${id}` }, response => {
      test.equal(response.statusCode, 404, '404')
      test.end()
      close()
    }).end()
  })
})

tape('GET /sellers/{id} error', test => {
  server((port, close) => {
    const id = require('../data/error-test-id')
    http.request({ port, path: `/sellers/${id}` }, response => {
      test.equal(response.statusCode, 500, '500')
      test.end()
      close()
    }).end()
  })
})

tape('POST /sellers/{id}', test => {
  server((port, close) => {
    const id = uuid.v4()
    http.request({ port, path: `/sellers/${id}`, method: 'POST' }, response => {
      test.equal(response.statusCode, 405, '405')
      test.end()
      close()
    }).end()
  })
})
