import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import { initialGameState, makeMove, ticTacToe } from './App'
import { createStore } from 'redux'


var store

beforeEach(() => {
  store = createStore(ticTacToe, initialGameState)
})


it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div)
})

it('has an empty starting board', () => {
  const game = store.getState()
  for (let square in game.squares) {
    expect(game.squares[square]).toEqual("")
  }
})

it('can make moves', () => {
  store.dispatch(makeMove("a1"))
  expect(store.getState().squares.a1).toEqual("X")
  store.dispatch(makeMove("a2"))
  expect(store.getState().squares.a2).toEqual("O")
})
