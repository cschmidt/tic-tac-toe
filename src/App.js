import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import './App.css'

const DEBUG = false

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
  },
  turn: players.X,
  outcome: outcomes.UNKNOWN
}


// Actions
const makeMove = (squareKey) => ({
  type:actions.MAKE_MOVE,
  squareKey: squareKey})


// Reducers
const move = (game = {}, action) => {
  switch (action.type) {
    case actions.MAKE_MOVE :
      var newGameState = Object.assign({}, game)
      var isSquareEmpty = newGameState.squares[action.squareKey] === ""
      // mark the game board (if the requested square is empty)
      if (isSquareEmpty) {
        newGameState.squares[action.squareKey] = game.turn
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
  if (DEBUG) console.log("ticTacToe", state, action)
  return move(state, action)
}


// Components

const Square = ({value = "", onClick}) => {
  return (
    <span className="ticTacToeSquare" onClick={onClick}>{value}</span>
  )
}

Square.propTypes = {
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string
}


const Board = ({game, onSquareClick}) => {
  return (
  <div>
    <h1>Tic Tac Toe</h1>
    <div className="ticTacToeBoard">
      {[1, 2, 3].map( (row) =>
        <div key={row}>
          {["a", "b", "c"].map((col) =>
            <Square key={col+row}
                onClick={() => onSquareClick(col+row)}
                value={game.squares[col+row]} />
            )}
        </div>
      )}
    </div>
  </div>
  )
}

Board.propTypes = {
  game: PropTypes.object.isRequired,
  onSquareClick: PropTypes.func.isRequired
}


const mapStateToProps = (state) => ({game: state})

const mapDispatchToProps = (dispatch) => ({
  onSquareClick: (key) => dispatch(makeMove(key))
})

const TicTacToe = connect(
  mapStateToProps,
  mapDispatchToProps
)(Board)


const App = () => (
  <div className="App">
    <TicTacToe />
  </div>
)


export default App
export {initialGameState, makeMove, ticTacToe}
