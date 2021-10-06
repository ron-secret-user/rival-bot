require('dotenv-flow').config()

const { conversationLength } = require('./config')
const log = require('./utils/logger')
const parseMessages = require('./utils/parse')

const { getMessages, getConversationId, registerUser, respondToBot } = require('./routes')

const inmemory = require('./db')

const username = 'elon musk'
const email = 'elonmusk@example.com'

async function main() {
  let tries = 0
  let success = 0
  let i = 0

  try {
    const userId = await registerUser(username, email)
    const conversationId = await getConversationId(userId)
    const messages = await getMessages(conversationId)

    log.info('----- Start -----', { name: inmemory.name, conversationId })
    log.bot('Bot says', messages)

    const readyResponse = parseMessages(messages)
    if (readyResponse === 'yes') {
      await respondToBot(conversationId, readyResponse)
    }

    while (i < conversationLength) {
      const nextMessage = await getMessages(conversationId)
      log.bot(`${i}:: nextMessage`, nextMessage)
      const answer = parseMessages(nextMessage)
      log.bot(`${i}:: answer`, answer)
      const response = await respondToBot(conversationId, answer)
      log.bot(`${i}:: response`, response)

      i++
      if (!response) {
        tries++
      } else {
        success++
      }
    }
  } catch ({ message }) {
    if (message === 'INVALID_RESPONSE' || message === 'INVALID_PARAMS') {
      log.debug('Check params')
    }
    log.error('ERROR-exiting', message)
    process.exit()
  }

  log.info('------END-------', { success, tries, length: i, profile: inmemory })
  process.exit()
}

main().catch((error) => {
  log.error(error)
  process.exit()
})
