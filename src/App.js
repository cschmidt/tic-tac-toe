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

const moveStates = {
  MOVE_PENDING: "MOVE_PENDING",
  MOVE_SUCCESS: "MOVE_SUCCESS",
  MOVE_ERROR: "MOVE_ERROR"
}

const initialGameState = {
  squares: {
    a1: {mark: "", moveState: null},
    a2: {mark: "", moveState: null},
    a3: {mark: "", moveState: null},
    b1: {mark: "", moveState: null},
    b2: {mark: "", moveState: null},
    b3: {mark: "", moveState: null},
    c1: {mark: "", moveState: null},
    c2: {mark: "", moveState: null},
    c3: {mark: "", moveState: null}
  },
  turn: players.X,
  outcome: outcomes.UNKNOWN,
  winningLine: null,
  synopsis: ""
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
const makeMove = (squareId) => ({
  type:actions.MAKE_MOVE,
  squareId})

// Reducers

const produceSynopsis = (outcome, turn) => {
  let synopsis = "?"
  switch (outcome) {
    case outcomes.UNKNOWN:
      synopsis = "In Progress"
      break
    case outcomes.WIN:
      synopsis = `${turn} wins!`
      break
    case outcomes.DRAW:
      synopsis = "Draw"
      break
    default:
      synopsis = "?"
  }
  return synopsis
}

const determineOutcome = (squares) => {
  // See if there's a straight line of one mark (X's or O's), or if the board
  // is fully marked without a winner (a draw).
  var outcome = outcomes.UNKNOWN
  var counts = {"X": 0, "O": 0, "": 0}
  var winningLine = null
  lines.forEach( (line) => {
    line.forEach( (square) => {
      counts[squares[square].mark]++
    })
    if (counts.X === 3 || counts.O === 3) {
      outcome = outcomes.WIN
      winningLine = line
    }
    // Reset X and O counts for next line (don't reset empty space count).
    counts.X = 0
    counts.O = 0
  })
  // If there are no empty squares, and we haven't already found a winner, we
  // must have a draw.
  if (outcome === outcomes.UNKNOWN && counts[""] === 0) {
    outcome = outcomes.DRAW
  }
  return {outcome, winningLine}
}


const move = (game = {}, action) => {
  switch (action.type) {
    case actions.MAKE_MOVE :
      var squares = {...game.squares}
      var squareId = action.squareId
      var isSquareEmpty = squares[squareId].mark === ""
      // mark the game board if the requested square is empty and the game is
      // still in play
      if (isSquareEmpty && game.outcome === outcomes.UNKNOWN) {
        squares[squareId] = {...squares[squareId], mark: game.turn}
        var {outcome, winningLine} = determineOutcome(squares)
        // switch players if the game is still in play
        var turn =
          outcome === outcomes.UNKNOWN ?
          (game.turn === players.X ? players.O : players.X) : game.turn
      }
      var synopsis = produceSynopsis(outcome, turn)
      return {...game, squares, turn, outcome, winningLine, synopsis}
    default:
      return game
  }
}


function ticTacToe(state, action) {
  return move(state, action)
}


// Components

const Square = ({mark = "", onClick, id, isMarkable}) => {
  return (
    <span
      className={"ticTacToeSquare" + (isMarkable ? " markable" : "")}
      onClick={onClick}>{mark}</span>
  )
}

Square.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  mark: PropTypes.string,
  isMarkable: PropTypes.bool
}

const SquareContainer = connect(
  (state, props) => {
    if (DEBUG) console.log("connect", props.id)
    let mark = state.squares[props.id].mark
    return {
      mark,
      isMarkable: mark === "" && state.outcome === outcomes.UNKNOWN }
  }
)(Square)


const Synopsis = ({synopsis}) => {
  return (<div className="ticTacToeSynopsis">{synopsis}</div>)
}

Synopsis.propTypes = {
  synopsis: PropTypes.string
}

const SynopsisContainer = connect(
  (state) => ({synopsis: state.synopsis})
)(Synopsis)

const Board = ({onSquareClick}) => {
  return (
  <div>
    <h1>Tic Tac Toe</h1>
    <div className="ticTacToeBoard">
      {[1, 2, 3].map( (row) =>
        <div key={row}>
          {["a", "b", "c"].map((col) => {
            let id = col+row
            return (<SquareContainer id={id} key={id}
                onClick={() => onSquareClick(id)} />)
          })}
        </div>
      )}
    </div>
    <SynopsisContainer />
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
