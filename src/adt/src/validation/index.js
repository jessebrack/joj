/* eslint fp/no-mutation:0,fp/no-throw:0 */
import { Just, Nothing } from '../maybe'
import { identity, isFunction } from '../combinators'

// Abstract
const Validation = {
  '@@type': 'Validation',
  '@@implements': ['of', 'map', 'ap', 'fold', 'flatMap', 'bimap', 'merge'],
  of: a => Success(a)
}

export const Success = (Validation.Success = a =>
  Object.assign(
    {
      [Symbol.for('maybe')]: () => Just(a),
      isSuccess: () => true,
      isFailure: () => false,
      fold: (fn = identity) => fn(a),
      foldOrElse: (fn = identity) => fn(a),
      map: fn => Validation.fromNullable(fn(a), ['Value is null']),
      flatMap: fn => Validation.fromNullable(fn(a).merge()),
      ap: Va =>
        (Va.isFailure()
          ? Va
          : a && isFunction(a)
              ? Success(
                  isFunction(Va.fold()) ? Va.fold().call(Va, a) : a(Va.fold())
                )
              : a ? Success(Va.fold().call(Va, a)) : Failure()),
      concat: Va => Va,
      bifold: (successTransform, _) => successTransform(a),
      // This what makes Validation not a real monad (also not a real disjunction)
      bimap: (successTransform, _) => Success(successTransform(a)),
      merge: () => a,
      getOrElse: defaultValue => a,
      getOrElseThrow: error => a,
      toMaybe: () => Just(a),
      toString: () => `Validation#Success (${a})`,
      toJSON: () => ({
        type: 'Validation#Success',
        value: a
      })
    },
    Validation
  ))

export const Failure = (Validation.Failure = b =>
  Object.assign(
    {
      [Symbol.for('maybe')]: () => Nothing(),
      isSuccess: () => false,
      isFailure: () => true,
      map: _ => Failure(b),
      flatMap: _ => Failure(b),
      ap: Va => (Va.isFailure() ? Failure(b.concat(Va.merge())) : Failure(b)),
      foldOrElse: (_, defaultValue) => defaultValue,
      concat: Va =>
        (Va.isFailure() ? Failure(b.concat(Va.fold())) : Failure(b)),
      bifold: (_, failTransform) => failTransform(b),
      // This what makes Validation not a real monad (also not a real disjunction)
      bimap: (_, failTransform) => Failure(failTransform(b)),
      fold: _ => errorWith('Unable to fold from a Validate.Failure'),
      merge: () => b,
      getOrElse: defaultValue => defaultValue,
      getOrElseThrow: error => {
        if (isError(error)) {
          throw error
        }
        throw new Error(error)
      },
      toMaybe: () => Nothing(),
      toString: () => `Validation#Failure (${b})`,
      toJSON: () => ({
        type: 'Validation#Failure',
        value: b
      })
    },
    Validation
  ))

function isError (e) {
  return e.constructor.name.includes('Error')
}

function errorWith (str) {
  // This will become more concise with throw expressions (https://github.com/tc39/proposal-throw-expressions)
  throw new TypeError(str)
}

Validation.fromNullable = (a, errors) =>
  (a != null ? Success(a) : Failure(errors))

Validation.fromMaybe = (Ma, errors) => () => {
  if (Ma['@@type'] === 'Maybe') {
    if (Ma.isJust()) {
      return Success(Ma.fold(a => a))
    }
    return Failure(errors)
  }
  return Validation.fromNullable(Ma, errors)
}

export default Validation
