const FormData = require('form-data')
const http = require('http')
const offer = require('./offer')
const server = require('./server')
const simpleConcat = require('simple-concat')
const tape = require('tape')
const uuid = require('uuid')
const writeTestOffer = require('./write-test-offer')

const path = '/order'

tape(`POST ${path}`, test => {
  submit([
    ['email', 'test@example.com'],
    ['jurisdiction', 'US-CA'],
    ['name', 'Joe Customer'],
    ['offerIDs[]', offer.id]
  ], (response, close) => {
    test.equal(response.statusCode, 303, '303')
    const location = response.headers.location
    test.assert(location, location)
    test.end()
    close()
  })
})

tape(`POST ${path} with extra field`, test => {
  submit([
    ['extra', 'extra'],
    ['email', 'test@example.com'],
    ['jurisdiction', 'US-CA'],
    ['name', 'Joe Customer'],
    ['offerIDs[]', offer.id]
  ], (response, close) => {
    test.equal(response.statusCode, 303, '303')
    const location = response.headers.location
    test.assert(location, location)
    test.end()
    close()
  })
})

tape(`POST ${path} with unknown offerID`, test => {
  const unknownOfferID = uuid.v4()
  submit([
    ['email', 'test@example.com'],
    ['jurisdiction', 'US-CA'],
    ['name', 'Joe Customer'],
    ['offerIDs[]', offer.id],
    ['offerIDs[]', unknownOfferID]
  ], (response, close) => {
    test.equal(response.statusCode, 400, '400')
    simpleConcat(response, (error, buffer) => {
      test.ifError(error, 'no concat error')
      const body = buffer.toString()
      test.assert(body.includes('Unknown OfferIDs'), 'Unknown OfferIDs')
      test.assert(body.includes(unknownOfferID), 'lists unknown offerID')
      test.end()
      close()
    })
  })
})

tape(`POST ${path} with no offerIDs`, test => {
  submit([
    ['email', 'test@example.com'],
    ['jurisdiction', 'US-CA'],
    ['name', 'Joe Customer']
  ], (response, close) => {
    test.equal(response.statusCode, 400, '400')
    simpleConcat(response, (error, buffer) => {
      test.ifError(error, 'no concat error')
      test.equal(buffer.toString(), 'Invalid Order', 'Invalid Order')
      test.end()
      close()
    })
  })
})

tape(`POST ${path} with no licensee info`, test => {
  submit([
    ['offerIDs[]', offer.id]
  ], (response, close) => {
    test.equal(response.statusCode, 400, '400')
    simpleConcat(response, (error, buffer) => {
      test.ifError(error, 'no concat error')
      test.equal(buffer.toString(), 'Invalid Order', 'Invalid Order')
      test.end()
      close()
    })
  })
})

function submit (fields, onResponse) {
  server((port, close) => {
    writeTestOffer(_ => {
      const form = new FormData()
      fields.forEach(field => {
        form.append(field[0], field[1])
      })
      const request = http.request({
        port,
        path,
        method: 'POST',
        headers: form.getHeaders()
      }, response => {
        onResponse(response, close)
      })
      form.pipe(request)
    })
  })
}

tape(`GET ${path}`, test => {
  server((port, close) => {
    http.request({ port, path, method: 'GET' }, response => {
      test.equal(response.statusCode, 405, '405')
      test.end()
      close()
    }).end()
  })
})
