const log = require('./logger')
const mathResponse = require('./math')

const mathOperations = [
  { condition: /largest/, type: 'largest' },
  { condition: /smallest/, type: 'smallest' },
  { condition: /[+]|sum|add/, type: 'add' },
  { condition: /[-]|difference|subtract/, type: 'subtract' },
  { condition: /[*]|product/, type: 'multiply' },
  { condition: /[/]|divide|quotient/, type: 'divide' },
]

const questionTypes = {
  ready: 'ready',
  math: 'math',
  comparison: 'comparison',
}

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

const extractNumberArray = (text) => {
  // assumes consistent formatting...
  return text
    .split(':')[1]
    .split(' ')
    .map((el) => Number(el.match(/\d+/)) || [])
    .flat()
}

const parseMessages = (messageQueue) => {
  if (!Array.isArray(messageQueue) || !messageQueue.length) {
    // Doesn't fit, but good enough assumption here.
    throw new Error('INVALID_PARAMS')
  }

  const { text } = messageQueue.pop()
  const regex = new RegExp(/are you ready?/i)
  const isReady = regex.test(text)
  if (isReady) {
    return 'yes'
  }

  const questionType = knownMessages.find(({ condition, type }) => {
    if (text.match(condition)) {
      return true
    }
    return false
  })

  if (questionType.type === questionTypes.math || questionType.type === questionTypes.comparison) {
    const operation = mathOperations.find(({ condition }) => {
      if (text.match(condition)) {
        return true
      }
      return false
    })

    const numbers = extractNumberArray(text)
    log.info('Parser: This is math related question.', { text, numbers })
    return mathResponse[operation.type](numbers)
  }
}

module.exports = parseMessages
