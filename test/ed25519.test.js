const tape = require('tape')

const ed25519 = require('../util/ed25519')

tape('ed25519', test => {
  const keys = ed25519.keys()
  test.equal(typeof keys.publicKey, 'string', 'publicKey string')
  test.equal(typeof keys.privateKey, 'string', 'privateKey string')
  const message = Buffer.from('test message')
  const signature = ed25519.sign(
    message, keys.publicKey, keys.privateKey
  )
  test.equal(typeof signature, 'string', 'signature string')
  test.assert(ed25519.verify(message, signature, keys.publicKey))
  test.end()
})
