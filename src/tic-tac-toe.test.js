'use strict'
/* global jest beforeEach it expect */
import TicTacToe from './tic-tac-toe'
import { outcomes, SquareAlreadyMarkedError, GameOverError } from './tic-tac-toe'

let ticTacToe = {}

const game = () => {
  return ticTacToe
}

beforeEach(() => {
  ticTacToe = new TicTacToe()
})

function mark(square) {
  game().mark(square)
}

it('has an empty starting board', () => {
  for (let square in game().squares) {
    expect(game().squares[square].mark).toEqual('')
  }
})

it('starts with the outcome being unknown', () => {
  expect(game().outcome).toEqual(outcomes.UNKNOWN)
})

it('can make moves and take turns', () => {
  mark('a1')
  expect(game().squares.a1.mark).toEqual('X')
  mark('a2')
  expect(game().squares.a2.mark).toEqual('O')
})

it('determines the winner', () => {
  mark('a1')
  // we still don't know the outcome after a single move
  expect(game().outcome).toEqual(outcomes.UNKNOWN)
  mark('b1')
  mark('a2')
  mark('b2')
  mark('a3')
  // X should have won
  expect(game().outcome).toEqual(outcomes.WIN)
  expect(game().turn).toEqual('X')
})

it('knows when the game is a draw', () => {
  mark('a1') // X
  mark('b1') // O
  mark('a2') // X
  mark('b2') // O
  mark('c1') // X
  mark('c2') // O
  mark('b3') // X
  mark('a3') // O
  mark('c3') // X
  // should now have a draw
  expect(game().outcome).toEqual(outcomes.DRAW)
  // last turn was X
  expect(game().turn).toEqual('X')
})

it('differentiates between draw and win with all squares marked', () => {
  mark('a1') // X
  mark('b1') // O
  mark('c1') // X
  mark('a2') // O
  mark('b2') // X
  mark('c2') // O
  mark('b3') // X
  mark('a3') // O
  mark('c3') // X
  expect(game().outcome).toEqual(outcomes.WIN)
  expect(game().winningLine).toEqual(['a1', 'b2', 'c3'])
})

it('prevents the same square from being marked twice', () => {
  mark('a1')
  expect(() => {
    mark('a1')
  }).toThrowError(SquareAlreadyMarkedError)
})

it('prevents play when the game is over', () => {
  mark('a1') // X
  mark('a2') // O
  mark('b1') // X
  mark('b2') // O
  mark('c1') // X
  expect(game().outcome).toEqual(outcomes.WIN)
  expect(() => {
    mark('c2')
  }).toThrowError(GameOverError)
})
