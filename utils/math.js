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
    return Math.max(...numbers)
  },
  smallest: (numbers) => {
    return Math.min(...numbers)
  },
}

module.exports = mathResponse
