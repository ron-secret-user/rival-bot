
const config = {
  baseUrl: process.env.RIVAL_BOT_URL,
  logLevel: process.env.LOG_LEVEL,
  conversationLength: process.env.CONVERSATION_LENGTH || 5,

  isDev: process.env.NODE_ENV !== 'production',
  isSilent: process.env.LOG_LEVEL === 'silent',
}

module.exports = config