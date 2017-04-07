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
  outcome: outcomes.UNKNOWN,
  winningLine: null
}


// Representations of all vertical, horizontal and diagonal lines
const lines =
  [["a1", "a2", "a3"],
   ["b1", "b2", "b3"],
   ["c1", "c2", "c3"],
   ["a1", "b1", "c1"],
   ["a2", "b2", "c2"],
   ["a3", "b3", "c3"],
   ["a1", "b2", "c3"],
   ["a3", "b2", "c1"]]


// Actions
const makeMove = (squareKey) => ({
  type:actions.MAKE_MOVE,
  squareKey: squareKey})

// Reducers

const determineOutcome = (game) => {
  // See if there's a straight line of one mark (X's or O's), or if the board
  // is fully marked without a winner (a draw).
  var outcome = {}
  var counts = {"X": 0, "O": 0, "": 0}
  lines.forEach( (line) => {
    line.forEach( (square) => {
      counts[game.squares[square]]++
    })
    if (counts.X === 3 || counts.O === 3) {
      outcome = { outcome: outcomes.WIN, winningLine: line }
    }
    // Reset X and O counts for next line (don't reset empty space count).
    counts.X = 0
    counts.O = 0
  })
  // If there are no empty squares, and we haven't already found a winner, we
  // must have a draw.
  if (outcome.outcome === undefined && counts[""] === 0) {
    outcome = { outcome: outcomes.DRAW }
  }
  return outcome
}


const move = (game = {}, action) => {
  switch (action.type) {
    case actions.MAKE_MOVE :
      // FIXME: need to have a dedicated reducer for squares?
      var newGameState = Object.assign({}, game)
      var squares = Object.assign({}, game.squares)
      var isSquareEmpty = squares[action.squareKey] === ""
      // mark the game board if the requested square is empty and the game is
      // still in play
      if (isSquareEmpty && newGameState.outcome === outcomes.UNKNOWN) {
        squares[action.squareKey] = game.turn
        newGameState.squares = squares
        // TODO: how to indicate that the square is filled already?
        var outcome = determineOutcome(newGameState)
        Object.assign(newGameState, outcome)
        // switch players if the game is still in play
        if (newGameState.outcome === outcomes.UNKNOWN) {
          newGameState.turn = (game.turn === players.X ? players.O : players.X)
        }
      }
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

const Square = ({value = "", onClick, id}) => {
  return (
    <span className="ticTacToeSquare" onClick={onClick}>{value}</span>
  )
}

Square.propTypes = {
  onClick: PropTypes.func.isRequired,
  value: PropTypes.string,
  id: PropTypes.string.isRequired
}

const VisibleSquare = connect(
  (state, props) => {
    if (DEBUG) console.log("connect", props.id)
    return {value: state.squares[props.id]}
  }
)(Square)


const GameStatus = ({outcome = outcomes.UNKNOWN}) => {
  return (
    <div>{outcome === outcomes.UNKNOWN ? "In Progress" : outcome}</div>
  )
}

const Board = ({onSquareClick}) => {
  return (
  <div>
    <h1>Tic Tac Toe</h1>
    <div className="ticTacToeBoard">
      {[1, 2, 3].map( (row) =>
        <div key={row}>
          {["a", "b", "c"].map((col) => {
            let id = col+row
            return (<VisibleSquare id={id} key={id}
                onClick={() => onSquareClick(id)} />)
            }
            )}
        </div>
      )}
    </div>
    <GameStatus />
  </div>
  )
}

Board.propTypes = {
  onSquareClick: PropTypes.func.isRequired
}

const mapDispatchToProps = (dispatch) => ({
  onSquareClick: (id) => {
    if (DEBUG) console.log("onSquareClick", id)
    dispatch(makeMove(id))
  }
})

const TicTacToe = connect(
  null,
  mapDispatchToProps
)(Board)


const App = () => (
  <div className="App">
    <TicTacToe />
  </div>
)


export default App
export {initialGameState, makeMove, outcomes, players, ticTacToe}
