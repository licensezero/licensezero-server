module.exports = (offer, callback) => {
  const issues = []
  const single = offer.pricing.single
  if (!single) {
    issues.push('Missing single license price.')
  } else if (single.currency !== 'USD') {
    issues.push(`Unsupported Currency: ${single.currency}.`)
  }
  callback(null, issues)
}
