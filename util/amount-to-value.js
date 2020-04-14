// Price objects stores prices as
// whole-number amounts.
//
// PayPal's API requires prices as value
// strings like `"10.00"`.
//
// This function converts amounts to
// value strings.

module.exports = (amount) => {
  const string = String(amount)
  const length = string.length
  if (length === 1) {
    return '0.0' + string
  } else if (length === 2) {
    return '0.' + string
  } else {
    return string.slice(0, -2) + '.' + string.slice(-2)
  }
}
