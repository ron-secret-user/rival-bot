const { createLogger } = require('bunyan')

const { isSilent, isDev } = require('../config')

// I used bunyan to bug http calls in development.
// For demo, default to console.log for less verbose
const logger = createLogger({ name: 'AlphaZero' })
// delete some extra fields in the log, for less verbose. Probably not ideal in an actual app.
if (isDev) {
  delete logger.fields.hostname
  delete logger.fields.pid
  delete logger.fields.name
  delete logger.time
}

const log = {
  info(msg, obj) {
    if (isSilent) return console.log(`${msg}: ${JSON.stringify(obj)}`)
    return logger.info(msg, obj)
  },
  error(msg, obj) {
    if (isSilent) return console.error(`${msg}: ${JSON.stringify(obj)}`)
    return logger.error(msg, obj)
  },
  debug(msg, obj) {
    if (isSilent) return console.log(`${msg}: ${JSON.stringify(obj)}`)
    return logger.debug(msg, obj)
  },
  bot(label, msg) {
    console.log('🤖', label, msg)
  },
}

module.exports = log
