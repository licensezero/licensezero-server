const tape = require('tape')
const schemas = require('../schemas')

const fixturesWithIDs = ['seller', 'offer']

fixturesWithIDs.forEach(name => {
  tape(`${name} fixture`, test => {
    const fixture = require(`./${name}`)
    test.assert(schemas.validate.id(fixture.id), 'valid identifier')
    test.assert(schemas.validate[name](fixture.data), `valid ${name}`)
    test.end()
  })
})

tape('broker fixture', test => {
  const broker = require('./broker')
  test.assert(schemas.validate.broker(broker), 'valid broker')
  test.end()
})
