const ed25519 = require('../util/ed25519')
const schemas = require('../schemas')
const tape = require('tape')
const uuid = require('uuid')

tape('validators', test => {
  test.assert(schemas.validate.id(uuid.v4()), 'validates UUID')
  test.assert(schemas.validate.url('https://licensezero.com'), 'validates HTTPS URL')
  const keys = ed25519.keys()
  test.assert(schemas.validate.publicKey(keys.publicKey), 'validates public key')
  test.assert(schemas.validate.privateKey(keys.privateKey), 'validates private key')
  const signature = ed25519.sign('test', keys.publicKey, keys.privateKey)
  test.assert(schemas.validate.signature(signature), 'validates signature')
  test.end()
})

tape('schemas', test => {
  test.equal(typeof schemas.json.id, 'object', 'UUID schema')
  test.equal(typeof schemas.json.url, 'object', 'URL schema')
  test.equal(typeof schemas.json.publicKey, 'object', 'public key schema')
  test.equal(typeof schemas.json.privateKey, 'object', 'private key schema')
  test.end()
})
