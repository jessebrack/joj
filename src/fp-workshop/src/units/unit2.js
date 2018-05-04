/**
 * Unit 2 Function Composition
 * @author Luis Atencio
 */
console.log('\x1b[33m', '-------Beginning of unit 2-------')

//
// COMPOSE 2
//
const compose2 = (f, g) => x => f(g(x))
const toChars = Array.from
const count = arr => (!arr ? 0 : arr.length)

const countLetters = compose2(count, toChars)
console.log('Letters in uxdevsummit:', countLetters('uxdevsummit'))

//
// COMPOSE 3
//
const compose3 = (f, g, h) => x => f(g(h(x)))
const padStr = s => s.padStart(2)
const map = f => arr => arr.map(f)
const toUpper = str => str.toUpperCase()

const formatString = compose3(map(toUpper), map(padStr), Array.from)
console.log(...formatString('uxdevsummit'))

//
// COMPOSE N
//
import { Combinators } from '../adt'
const { compose } = Combinators

//
// Exercise 2.1 Count the number of words using this input variable
//
const input = 'The quick brown fox jumps over the lazy dog'
// const tokenize = str => str.split(/\s/)
// const count = arr => (!arr ? 0 : arr.length)
// const countWords = compose(count, tokenize)
//console.log('Number of words', countWords(input))

// const countRec = ([a, ...tail]) => (!a ? 0 : 1 + countRec(tail))
// const countWords2 = compose(countRec, tokenize)
// console.log(
//   'Number of words',
//   countWords2('The quick brown fox jumps over the lazy dog')
// )

console.log('%s\x1b[0m', '-------End of unit 2-------')