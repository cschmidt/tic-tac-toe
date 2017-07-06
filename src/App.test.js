import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'
import App from './App'
import {
  initialGameState,
  makeMove,
  movePending,
  outcomes,
  submitMove,
  squares,
  ticTacToe
} from './App'
import { combineReducers, createStore, applyMiddleware } from 'redux'


let store
jest.useFakeTimers()

const game = () => {
  return store.getState().ticTacToe
}

beforeEach(() => {
  store = createStore(combineReducers({ticTacToe}), undefined, applyMiddleware(thunkMiddleware))
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
  for (let square in game().squares) {
    expect(game().squares[square].mark).toEqual("")
  }
})

it('starts with the outcome being unknown', () => {
  expect(game().outcome).toEqual(outcomes.UNKNOWN)
})

it('can make moves and take turns', () => {
  mark("a1")
  expect(game().squares.a1.mark).toEqual("X")
  mark("a2")
  expect(game().squares.a2.mark).toEqual("O")
})

it('determines the winner', () => {
  mark("a1")
  // we still don't know the outcome after a single move
  expect(game().outcome).toEqual(outcomes.UNKNOWN)
  mark("b1")
  mark("a2")
  mark("b2")
  mark("a3")
  // X should have won
  expect(game().outcome).toEqual(outcomes.WIN)
  expect(game().turn).toEqual("X")
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
  expect(game().outcome).toEqual(outcomes.DRAW)
  // last turn was X
  expect(game().turn).toEqual("X")
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
  expect(game().outcome).toEqual(outcomes.WIN)
  expect(game().winningLine).toEqual(['a1', 'b2', 'c3'])
})
