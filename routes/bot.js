const axios = require('axios')

const db = require('../db')
const log = require('../utils/logger')
const routes = require('./routes')

const getMessages = async (conversationId) => {
  log.info('getMessages-request', { conversationId })

  try {
    if (!conversationId || !db.conversationId) {
      log.debug('getMessages-invalid conversation id', { conversationId })
      throw new Error('INVALID_PARAMS')
    }

    const { data } = await axios.get(routes.bot(conversationId), {
      header: {
        'content-type': 'application/json',
      },
    })

    if (!data || !data.messages) {
      throw new Error('INVALID_RESPONSE')
    }

    db.messages = [...data.messages]
    return data.messages
  } catch (err) {
    log.error('getMessages-exception', { conversationId, message: err.message })
    throw new Error(err.message)
  }
}

const respondToBot = async (conversationId, answer) => {
  log.info('respondToBot-request', { conversationId, answer })

  try {
    if (!answer || !conversationId) {
      log.debug('respondToBot-invalid request', { conversationId, answer })
      throw new Error('INVALID_PARAMS')
    }
    const { data } = await axios.post(routes.bot(conversationId), {
      header: {
        'content-type': 'application/json',
      },
      content: `${answer}`,
    })

    if (!data || !data.correct) {
      throw new Error('INVALID_RESPONSE')
    }

    log.info('respondToBot-success', { data })
    return data.correct
  } catch (err) {
    log.error('respondToBot-exception', { err, answer })
    throw new Error(err.message)
  }
}

module.exports = {
  getMessages,
  respondToBot,
}
