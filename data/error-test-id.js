// This module exports a magic UUID that tests use to
// cover data-access error handling branches.

const uuid = require('uuid')

module.exports = process.env.NODE_ENV === 'test'
  ? uuid.v4()
  : /* istanbul ignore next */ null
