const ed25519 = require('../util/ed25519')
const fs = require('fs')
const http = require('http')
const path = require('path')
const rimraf = require('rimraf')
const spawn = require('child_process').spawn
const tape = require('tape')

tape('server.js', (test) => {
  const keys = ed25519.keys()
  const port = 8888

  fs.mkdtemp('/tmp/', (ignore, directory) => {
    const server = spawn(
      process.argv[0],
      [path.join(__dirname, '..', 'server.js')],
      {
        env: {
          DIRECTORY: directory,
          NODE_ENV: 'test',
          PORT: port,
          PRIVATE_KEY: keys.privateKey,
          PUBLIC_KEY: keys.publicKey,
          REDIRECT: 'http://example.com'
        }
      }
    )

    setTimeout(() => {
      http.request({ port })
        .once('error', error => {
          test.fail(error)
          finish()
        })
        .once('response', response => {
          test.equal(response.statusCode, 303, '303')
          finish()
        })
        .end()
    }, 500)

    function finish () {
      server.kill(9)
      rimraf.sync(directory)
      test.end()
    }
  })
})
