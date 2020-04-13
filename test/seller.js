const uuid = require('uuid')

exports.id = uuid.v4()

exports.data = {
  email: 'seller@example.com',
  jurisdiction: 'US-CA',
  name: 'Joe Licensor',
  website: 'https://example.com/~seller'
}
