const axios = require('axios')

const db = require('../db')
const log = require('../utils/logger')
const routes = require('./routes')

const getConversationId = async (userId) => {
  log.info('getConversationId-request', { userId })
  try {
    if (!userId || !db.userId) {
      log.debug('getConversationId-no userId', { userId, db })
      throw new Error('INVALID_PARAMS')
    }
    const { data } = await axios.post(routes.conversationId, {
      header: {
        'content-type': 'application/json',
      },
      user_id: userId,
    })

    if (!data || !data.conversation_id) {
      throw new Error('INVALID_RESPONSE')
    }

    log.info('getConversationId-success', { conversationId: data.conversation_id })
    db.conversationId = data.conversation_id
    return data.conversation_id
  } catch (err) {
    log.error('getConversationId', { err, userId })
    throw new Error(err.message)
  }
}

module.exports = getConversationId