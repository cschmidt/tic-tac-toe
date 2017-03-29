import React, { Component, PropTypes } from 'react'
import { createStore } from 'redux'
import logo from './logo.svg'
import './App.css'


// Type Constants

const players = {
  X: "X",
  O: "O"
}

const outcomes = {
  UNKNOWN: "UNKNOWN",
  WIN: "WIN",
  DRAW: "DRAW"
}

const actions = {
  MAKE_MOVE: "MAKE_MOVE"
}

const initialGameState = {
  rows: [["", "", ""], ["", "", ""], ["","",""]],
  turn: players.X,
  outcome: outcomes.UNKNOWN
}

const alternateInitialGameState = {
  turn: players.X,
  outcome: outcomes.UNKNOWN,
  squares: {
    a1: "",
    a2: "",
    a3: "",
    b1: "",
    b2: "",
    b3: "",
    c1: "",
    c2: "",
    c3: ""
  }
}

const alternateInitialGameState2 = {
  turn: players.X,
  outcome: outcomes.UNKNOWN,
  squares: {
    1: "",
    2: "",
    3: "",
    4: "",
    5: "",
    6: "",
    7: "",
    8: "",
    9: ""
  }
}


// Actions
const makeMove = (rowNum, colNum) => ({
  type:actions.MAKE_MOVE,
  row: rowNum,
  col: colNum})


// Reducers
const move = (game = {}, action) => {
  switch (action.type) {
    case actions.MAKE_MOVE :
      var newGameState = Object.assign({}, game)
      var isSquareEmpty = newGameState.rows[action.row][action.col] === ""
      // mark the game board (if the requested square is empty)
      if (isSquareEmpty) {
        newGameState.rows[action.row][action.col] = game.turn
        // switch players
        newGameState.turn = (game.turn === players.X ? players.O : players.X)
      }
      // TODO: how to indicate that the square is filled already?
      // TODO: check if the game is over (either by win or draw)
      return newGameState
    default:
      return game
  }
}


function ticTacToe(state, action) {
  console.log("ticTacToe", state, action)
  return move(state, action)
}

const store = createStore(ticTacToe, initialGameState)

// Components

const Square = (square, rowNum, colNum) => {
  const dispatch = (event) => {
    store.dispatch(makeMove(rowNum, colNum))
  }
  return React.createElement("span",
                      {className: "ticTacToeSquare",
                       key: rowNum.toString() + "-" + colNum.toString(),
                       onClick: dispatch},
                       square)
}

const Row = (row, rowNum) =>
  <div className="ticTacToeRow" key={rowNum}>
    {row.map((square, colNum) => Square(square, rowNum, colNum))}
  </div>

const Board = ({game}) =>
  <div>
    <h1>Tic Tac Toe</h1>
    <div className="ticTacToeBoard">
      {game.rows.map((row, rowNum) => Row(row,rowNum))}
    </div>
  </div>

Board.propTypes = {
  game: PropTypes.object.isRequired
}

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <div className="App-intro">
          <Board game={store.getState()} />
        </div>
      </div>
    );
  }
}

export default App
