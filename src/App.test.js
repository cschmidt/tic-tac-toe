import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import { initialGameState, makeMove, outcomes, ticTacToe } from './App'
import { createStore } from 'redux'

let store

beforeEach(() => {
  store = createStore(ticTacToe, initialGameState)
})

function mark(square) {
  store.dispatch(makeMove(square))
}

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div)
})

it('has an empty starting board', () => {
  let game = store.getState()
  for (let square in game.squares) {
    expect(game.squares[square]).toEqual("")
  }
})

it('can make moves and take turns', () => {
  mark("a1")
  expect(store.getState().squares.a1).toEqual("X")
  mark("a2")
  expect(store.getState().squares.a2).toEqual("O")
})

it('determines the winner', () => {
  // starting a new game, so the outcome shouldn't be known, right?
  expect(store.getState().outcome).toEqual(outcomes.UNKNOWN)
  mark("a1")
  // we still don't know the outcome after a single move
  expect(store.getState().outcome).toEqual(outcomes.UNKNOWN)
  mark("b1")
  mark("a2")
  mark("b2")
  mark("a3")
  // X should have won
  expect(store.getState().outcome).toEqual(outcomes.WIN)
  expect(store.getState().turn).toEqual("X")
})
