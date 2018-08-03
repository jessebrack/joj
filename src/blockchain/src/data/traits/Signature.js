import Maybe from '@joj/adt/maybe'
import SecureHandler from '../../common/SecureHandler'
import crypto from 'crypto'

const ENCODING_HEX = 'hex'
const SIGN_ALGO = 'RSA-SHA256'

export const Signature = (state, keys) => ({
  generateSignature (privateKeyPath) {
    return signInput(
      privateKeyPath,
      keys.map(k => state[k]).filter(prop => !!prop).join('')
    )
  },
  set signature (s) {
    state.signature = s
  },
  verifySignature () {
    return signatureVerifier(
      state.sender || state.recipient,
      keys.map(k => state[k]).filter(prop => !!prop).join(''),
      state.signature
    )
  }
})

/**
 * Signs the input data given a private key
 *
 * @param {string} privateKey Private key used to sign
 * @param {string} input      Input data to sign
 * @return {string} Signed data
 * @throws {RangeError} In case any of actual arguments is invalid
 */
const signInput = (privateKey, input) =>
  Maybe.of(k => i => k)
    .ap(Maybe.fromNullable(privateKey))
    .ap(Maybe.fromNullable(input))
    .map(String)
    .map(key => ({ key }))
    .map(credentials => {
      const sign = crypto.createSign(SIGN_ALGO)
      sign.update(input)
      return sign.sign(credentials, ENCODING_HEX)
    })
    .getOrElseThrow(
      new RangeError(
        'Please provide valid arguments for [privateKey] and [input]'
      )
    )

const verifySignatureInput = (publicKey, data, signature) =>
  Maybe.of(k => d => s => [k, d, s])
    .ap(Maybe.fromNullable(publicKey).map(String))
    .ap(Maybe.fromNullable(data))
    .ap(Maybe.fromNullable(signature))
    .map(([pem, input, sign]) => {
      const verify = crypto.createVerify(SIGN_ALGO)
      verify.update(input)
      return verify.verify(pem, sign, ENCODING_HEX)
    })
    .getOrElseThrow(
      new RangeError(
        `Please provide valid arguments for publicKey: [${publicKey}], data: [${data}], and signature: [${signature}]`
      )
    )

const signatureVerifier = !process.env.SECURE
  ? new Proxy(
      verifySignatureInput,
      SecureHandler(process.env.SECURE_ATTEMPTS || 3)
    )
  : verifySignatureInput

export default Signature
