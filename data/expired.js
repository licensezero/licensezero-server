const ONE_DAY = 24 * 60 * 60 * 1000

module.exports = (created) => {
  return (new Date() - new Date(created)) > ONE_DAY
}
