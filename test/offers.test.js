const http = require('http')
const offer = require('./offer')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const uuid = require('uuid')
const writeTestOffer = require('./write-test-offer')

tape('GET /offers/{id}', test => {
  server((port, close) => {
    writeTestOffer(_ => {
      http.request({ port, path: `/offers/${offer.id}` }, response => {
        test.equal(response.statusCode, 200, '200')
        test.equal(response.headers['content-type'], 'application/json', 'application/json')
        simpleConcat(response, (error, buffer) => {
          test.ifError(error, 'no body read error')
          test.deepEqual(JSON.parse(buffer), offer.data, 'offer JSON')
          test.end()
          close()
        })
      }).end()
    })
  })
})

tape('GET /offers/{invalid}', test => {
  server((port, close) => {
    http.request({ port, path: '/offers/x' }, response => {
      test.equal(response.statusCode, 400, '400')
      test.end()
      close()
    }).end()
  })
})

tape('GET /offers/{nonexistent}', test => {
  server((port, close) => {
    const id = uuid.v4()
    http.request({ port, path: `/offers/${id}` }, response => {
      test.equal(response.statusCode, 404, '404')
      test.end()
      close()
    }).end()
  })
})

tape('GET /offers/{id} error', test => {
  server((port, close) => {
    const id = require('../data/error-test-id')
    http.request({ port, path: `/offers/${id}` }, response => {
      test.equal(response.statusCode, 500, '500')
      test.end()
      close()
    }).end()
  })
})

tape('POST /offers/{id}', test => {
  server((port, close) => {
    const id = uuid.v4()
    http.request({ port, path: `/offers/${id}`, method: 'POST' }, response => {
      test.equal(response.statusCode, 405, '405')
      test.end()
      close()
    }).end()
  })
})
