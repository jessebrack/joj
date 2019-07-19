import {
  compose,
  curry,
  filter,
  flatMap,
  map,
  not,
  prop,
  reduce
} from '@joj/blockchain/lib/fp/combinators.mjs'
import Blockchain from '@joj/blockchain/domain/Blockchain.mjs'
import Money from '@joj/blockchain/domain/value/Money.mjs'
import Transaction from '@joj/blockchain/domain/Transaction.mjs'
import chai from 'chai'

const { assert } = chai

const balanceOf = curry((addr, tx) =>
  Money.sum(
    tx.recipient === addr ? tx.funds : Money.zero(),
    tx.sender === addr ? tx.funds.asNegative() : Money.zero()
  )
)

describe('4.6 - Imperative to functional transformation', () => {
  let ledger = null

  beforeEach(() => {
    ledger = new Blockchain()
    const tx1 = new Transaction('sender123', 'recipient123', (10).jsl(), 'Test')
    const tx2 = new Transaction('sender123', 'recipient123', (10).jsl(), 'Test2')
    ledger.addPendingTransactions(tx1, tx2)
    ledger.newBlock()
  })
  it('Calculate balance in Wallet using FP', () => {
    function computeBalance(ledger, address) {
      return Array.from(ledger) //#A
        .filter(not(prop('isGenesis'))) //#B
        .map(prop('data')) //#C
        .flat() //#D
        .map(balanceOf(address)) //#E
        .reduce(Money.sum, Money.zero()) //#F
        .round() //#G
    }
    assert.isTrue(computeBalance(ledger, 'sender123').equals((-20).jsl()))
    assert.isTrue(computeBalance(ledger, 'recipient123').equals((20).jsl()))
  })

  it('Calculate balance in Wallet using FP with flatMap', () => {
    function computeBalance(ledger, address) {
      return Array.from(ledger)
        .filter(not(prop('isGenesis')))
        .flatMap(prop('data')) //#B
        .map(balanceOf(address))
        .reduce(Money.sum, Money.zero())
        .round()
    }

    assert.isTrue(computeBalance(ledger, 'sender123').equals((-20).jsl()))
    assert.isTrue(computeBalance(ledger, 'recipient123').equals((20).jsl()))
  })

  it('Calculate balance in Wallet using FP in point-free style', () => {
    const computeBalance = address =>
      compose(
        //#A
        Money.round,
        reduce(Money.sum, Money.zero()), //#B
        map(balanceOf(address)), //#B
        flatMap(prop('data')), //#B
        filter(
          //#B
          compose(
            //#C
            not,
            prop('isGenesis')
          )
        ),
        Array.from
      )

    const computeBalanceForSender123 = computeBalance('sender123')
    assert.isTrue(computeBalanceForSender123(ledger).equals((-20).jsl()))
  })
})
