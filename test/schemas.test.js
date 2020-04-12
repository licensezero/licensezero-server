const ed25519 = require('../util/ed25519')
const schemas = require('../schemas')
const tape = require('tape')
const uuid = require('uuid')

tape('validators', test => {
  test.assert(schemas.validate.id(uuid.v4()), 'validates UUID')
  test.assert(schemas.validate.url('https://licensezero.com'), 'validates HTTPS URL')
  test.assert(schemas.validate.key(ed25519.keys().publicKey), 'validates public key')
  test.end()
})

tape('schemas', test => {
  test.equal(typeof schemas.json.id, 'object', 'UUID schema')
  test.equal(typeof schemas.json.url, 'object', 'URL schema')
  test.equal(typeof schemas.json.key, 'object', 'key schema')
  test.end()
})
