const axios = require('axios')

const db = require('../db')
const log = require('../utils/logger')
const routes = require('./routes')

const registerUser = async (name, email) => {
  log.info('registerUser-request', { name, email })
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

    db.userId = data.user_id
    db.name = name
    db.email = email
    
    log.info('registerUser-success', { userId: data.user_id })
    return data.user_id
  } catch (err) {
    log.error('registerUser-Exception', { err, name, email })
    throw new Error(err.message)
  }
}

module.exports = registerUser
