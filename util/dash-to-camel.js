module.exports = (name) => name.replace(/-(\w)/g, match => match[1].toUpperCase())
