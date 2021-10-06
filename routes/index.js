const registerUser = require('./user')
const getConversationId = require('./conversation')
const { getMessages, respondToBot } = require('./bot')

const modules = {
  getMessages,
  getConversationId,

  registerUser,
  respondToBot,
}

module.exports = modules