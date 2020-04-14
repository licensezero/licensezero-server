const tape = require('tape')
const amountToValue = require('../util/amount-to-value')

tape('amount to value', test => {
  const items = [
    [1, '0.01'],
    [10, '0.10'],
    [100, '1.00'],
    [1000000, '10000.00']
  ]
  items.forEach(item => {
    test.equal(amountToValue(item[0]), item[1], item[1])
  })
  test.end()
})
