const commonmark = require('commonmark')

module.exports = (markdown) => {
  const reader = new commonmark.Parser()
  const writer = new commonmark.HtmlRenderer({ smart: true })
  const parsed = reader.parse(markdown)
  return writer.render(parsed)
}
