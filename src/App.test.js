import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import App from './App'
import {
  asyncMove,
  initialGameState,
  makeMove,
  movePending,
  outcomes,
  submitMove,
  squares,
  ticTacToe
} from './App'
import { createStore, applyMiddleware } from 'redux'

let store
jest.useFakeTimers()

beforeEach(() => {
  store = createStore(ticTacToe, initialGameState, applyMiddleware(thunkMiddleware))
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
    expect(game.squares[square].mark).toEqual("")
  }
})

it('starts with the outcome being unknown', () => {
  expect(store.getState().outcome).toEqual(outcomes.UNKNOWN)
})

it('can make moves and take turns', () => {
  mark("a1")
  expect(store.getState().squares.a1.mark).toEqual("X")
  mark("a2")
  expect(store.getState().squares.a2.mark).toEqual("O")
})

it('determines the winner', () => {
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

it('knows when the game is a draw', () => {
  mark("a1") // X
  mark("b1") // O
  mark("a2") // X
  mark("b2") // O
  mark("c1") // X
  mark("c2") // O
  mark("b3") // X
  mark("a3") // O
  mark("c3") // X
  // should now have a draw
  expect(store.getState().outcome).toEqual(outcomes.DRAW)
  // last turn was X
  expect(store.getState().turn).toEqual("X")
})

it('differentiates between draw and win with all squares marked', () => {
  mark("a1") // X
  mark("b1") // O
  mark("c1") // X
  mark("a2") // O
  mark("b2") // X
  mark("c2") // O
  mark("b3") // X
  mark("a3") // O
  mark("c3") // X
  expect(store.getState().outcome).toEqual(outcomes.WIN)
  expect(store.getState().winningLine).toEqual(['a1', 'b2', 'c3'])
})

it('supports async moves', async () => {
  store.dispatch(asyncMove("a1"))
  expect(store.getState().squares.a1.moveState).toEqual("MOVE_PENDING")
  expect(movePending(store.getState())).toBeTruthy()
  jest.runAllTimers()
  expect(store.getState().turn).toEqual("O")
  let squares = store.getState().squares
  expect(squares.a1.moveState).toEqual("MOVE_COMPLETE")
  expect(squares.a1.mark).toEqual("X")
  expect(movePending(store.getState())).toBeFalsy()
})
