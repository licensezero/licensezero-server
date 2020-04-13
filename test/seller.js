const uuid = require('uuid')

exports.id = uuid.v4()

exports.data = {
  email: 'seller@example.com',
  jurisdiction: 'US-CA',
  name: 'Joe Licensor',
  url: 'https://example.com/~seller'
}
