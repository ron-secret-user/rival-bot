const { baseUrl } = require('../config')

const routes = {
  register: `${baseUrl}/challenge-register`,
  conversationId: `${baseUrl}/challenge-conversation`,
  bot: (conversationid) => `${baseUrl}/challenge-behaviour/${conversationid}`,
}

module.exports = routes
