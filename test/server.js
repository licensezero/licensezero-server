const ed25519 = require('../util/ed25519')
const fs = require('fs')
const http = require('http')
const makeHandler = require('../')
const pino = require('pino')
const rimraf = require('rimraf')

module.exports = function (/* [port,] callback */) {
  var port
  var callback
  if (arguments.length === 2) {
    port = arguments[0]
    callback = arguments[1]
  } else {
    port = 0
    callback = arguments[0]
  }
  fs.mkdtemp('/tmp/', (ignore, directory) => {
    const keys = ed25519.keys()
    process.env.DIRECTORY = directory
    process.env.PUBLIC_KEY = keys.publicKey
    process.env.PRIVATE_KEY = keys.privateKey
    process.env.REDIRECT = 'http://example.com'
    const log = pino({}, fs.createWriteStream('test-server.log'))
    const server = http.createServer(makeHandler(log))
    server.listen(port, function () {
      callback(this.address().port, () => {
        server.close(() => {
          rimraf.sync(directory)
        })
      })
    })
  })
}
