const axios = require('axios')
const bunyan = require('bunyan')

const log = bunyan.createLogger({ name: 'AlphaZero' })
delete log.fields.hostname // not recommended in production. Just makes it prettier locally.
delete log.fields.pid
delete log.fields.name
delete log.time

const RIVAL_BOT_URL = 'https://us-central1-rival-chatbot-challenge.cloudfunctions.net'

const routes = {
  register: `${RIVAL_BOT_URL}/challenge-register`,
  conversationId: `${RIVAL_BOT_URL}/challenge-conversation`,
  bot: (conversationid) => `${RIVAL_BOT_URL}/challenge-behaviour/${conversationid}`,
}

const username = 'elon musk'
const email = 'elonmusk@example.com'

const inmemory = {
  userId: '',
  conversationId: '',
  messageHistory: [],
}

const registerUser = async (name, email) => {
  log.info('registerUser', { name, email })
  try {
    const { data } = await axios.post(routes.register, {
      header: {
        'content-type': 'application/json',
      },
      name,
      email,
    })

    if (!data || !data.user_id) {
      throw new Error('INVALID_RESPONSE')
    }
    inmemory.userId = data.user_id
    log.info('registerUser-success', { inmemory })
    return inmemory.userId
  } catch (err) {
    log.error('registerUser-Exception', { err, name, email })
    throw new Error(err.message)
  }
}

const getConversationId = async (userId) => {
  log.info('getConversationId', { userId })
  try {
    if (!userId || !inmemory.userId) {
      log.debug('getConversationId-no userId', { userId, inmemory })
      return null
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

    log.info('getConversationId-success', { data })
    inmemory.conversationId = data.conversation_id
    return data.conversation_id
  } catch (err) {
    log.error('getConversationId', { err, userId })
    throw new Error(err.message)
  }
}

const getMessages = async (conversationId) => {
  log.info('getMessages', { conversationId })
  if (!conversationId || !inmemory.conversationId) {
    log.debug('getMessages-invalid conversation id', { conversationId })
    return null
  }
  try {
    const { data } = await axios.get(routes.bot(conversationId), {
      header: {
        'content-type': 'application/json',
      },
    })

    if (!data || !data.messages) {
      throw new Error('INVALID_RESPONSE')
    }

    inmemory.messages = [...data.messages]
    return data.messages
  } catch (err) {
    log.error('getMessages-exception', { conversationId, message: err.message })
    throw new Error(err.message)
  }
}

const questionTypes = {
  ready: 'ready',
  math: 'math',
  comparison: 'comparison',
}

const mathResponse = {
  add: (numbers) => {
    let sum = 0
    numbers.forEach((number) => {
      sum += Number(number) | 0
    })
    return sum
  },
  subtract: (numbers) => {
    let diff = 0
    numbers.forEach((number) => {
      diff += Number(number) | 0
    })
    return diff
  },
  multiply: (numbers) => {
    let product = 1
    numbers.forEach((number) => {
      product *= Number(number) | 1
    })
    return product
  },
  divide: (numbers) => {
    let quotient = 1
    numbers.forEach((number) => {
      quotient /= Number(number) | 1
    })

    return quotient
  },
  largest: (numbers) => {
      console.log('largest, math.max', Math.max(...numbers))
    return Math.max(...numbers)
  },
  smallest: (numbers) => {
    return Math.min(...numbers)
  },
}

const mathOperations = [
  { condition: /largest/, type: 'largest' },
  { condition: /smallest/, type: 'smallest' },
  { condition: /[+]|sum|add/, type: 'add' },
  { condition: /[-]|difference|subtract/, type: 'subtract' },
  { condition: /[*]|product/, type: 'multiply' },
  { condition: /[/]|divide|quotient/, type: 'divide' },
]

const knownMessages = [
  { condition: /are you ready/i, type: questionTypes.ready },
  {
    condition: /largest|smallest/i,
    type: questionTypes.comparison,
  },
  {
    condition: /math|add|sum|multiply|subtract|divide|[+]|[x]|[*]|[-]|[/]/i,
    type: questionTypes.math,
  },
]

const knownResponses = {
  ready: 'yes',
  default: '42', // aka I don't know
}

const respondToBot = async (conversationId, answer) => {
  if (!answer || !conversationId) {
    log.debug('respondToBot-invalid request', { conversationId, answer })
    return null
  }
  try {
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

const parseMessages = (messageQueue) => {
  if (!Array.isArray(messageQueue) || !messageQueue.length) {
    console.log('No messages')
    return null
  }
  const { text } = messageQueue.pop()
  const regex = new RegExp(/are you ready to begin?/i)
  const isReady = regex.test(text)
  if (isReady) {
    return 'ready'
  }

  const questionType = knownMessages.find(({ condition, type }) => {
    if (text.match(condition)) {
      return true
    }
    return false
  })

  console.log('text', text)

  if (questionType.type === questionTypes.math || questionType.type === questionTypes.comparison) {
    const operation = mathOperations.find(({ condition, type }) => {
      if (text.match(condition)) {
        return true
      }
      return false
    })

    const numbers = extractNumberArray(text)
    console.log({ numbers, operation })
    return mathResponse[operation.type](numbers)
  }
}

const extractNumberArray = (text) => {
  // assumes consistent formatting...
  return text
    .split(':')[1]
    .split(' ')
    .map((el) => Number(el.match(/\d+/)) || [])
    .flat()
}

async function main() {
  const userId = await registerUser(username, email)
  const conversationId = await getConversationId(userId)
  const messages = await getMessages(conversationId)

  // For the messages, I will be using console.log, since this is just local.
  console.log('--------------- Start ---------------')
  console.log('🤖 Bot says', messages)

  const ready = parseMessages(messages)
  let botResponse = false
  if (knownResponses[ready]) {
    botResponse = await respondToBot(conversationId, knownResponses[ready])
  }

  let tries = 0
  let success = 0
  let i = ``
  while (tries < 3 || success < 5 || i < 5) {
    try {
      const nextMessage = await getMessages(conversationId)
      console.log(`${i}:: nextMessage`, nextMessage)
      const answer = parseMessages(nextMessage)
      console.log(`${i}:: answer`, answer)
      const response = await respondToBot(conversationId, answer)
      console.log(`${i}:: response`, response)

      i++
      if (!response) {
        tries++
      } else {
        success++
      }
    } catch ({ message }) {
      console.log('error-', message)
      process.exit()
    }
  }

  console.log('----------- End ---------------')
  console.log({ tries, success, profile: inmemory })
  process.exit()
}

main().catch((error) => {
  log.error(error)
  process.exit()
})
