import * as _ from 'underscore'
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import './App.css'

const DEBUG = true

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
  SUBMIT_MOVE: "SUBMIT_MOVE",
  MAKE_MOVE: "MAKE_MOVE",
  RECEIVE_MOVE: "RECEIVE_MOVE"
}

const moveStates = {
  MOVE_PENDING: "MOVE_PENDING",
  MOVE_COMPLETE: "MOVE_COMPLETE",
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
  squareId,
  meta: {local: false}})

const submitMove = (squareId) => ({
  type: actions.SUBMIT_MOVE,
  squareId,
  meta: {local: true}})

// Utility functions
const debug = (...args) => {
  if (DEBUG) console.log(...args)
}

// Predicates (?)

const inProgress = (game) => {
  return game.outcome === outcomes.UNKNOWN
}

const movePending = (game) => {
  return _.some(game.squares,
    (square) => {return square.moveState === moveStates.MOVE_PENDING})
}

// Errors

function MoveInProgressError(squareId) {
  this.squareId = squareId
  this.message = `Waiting for move to complete on ${squareId}`
  this.toString = () => {
    return this.message
  }
}

function GameOverError() {
  this.message = "Game Over!"
  this.toString = () => {
    return this.message
  }
}

function SquareAlreadyMarkedError(squareId) {
  this.squareId = squareId
  this.message = `${squareId} is already marked`
  this.toString = () => {
    return this.message
  }
}

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
      debug("Oh no, outcome was unexpected!", outcome)
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


const move = (game = initialGameState, action) => {
  debug("move", action, game)
  var squares = {...game.squares}
  var squareId = action.squareId
  var isSquareEmpty = squares[squareId] && squares[squareId].mark === ""

  switch (action.type) {
    case actions.MAKE_MOVE:
      // mark the game board if the requested square is empty and the game is
      // still in play
      if (isSquareEmpty && inProgress(game)) {
        squares[squareId] = {...squares[squareId],
                             mark: game.turn,
                             moveState: moveStates.MOVE_COMPLETE}
        var {outcome, winningLine} = determineOutcome(squares)
        // switch players if the game is still in play
        var turn =
          outcome === outcomes.UNKNOWN ?
          (game.turn === players.X ? players.O : players.X) : game.turn
      }
      var synopsis = produceSynopsis(outcome, turn)
      return {...game, squares, turn, outcome, winningLine, synopsis}
    case actions.SUBMIT_MOVE:
      debug( "submitMove", squareId, game)
      if (movePending(game)) {
        // FIXME: incorrect square specified as "in progress"
        throw new MoveInProgressError(squareId)
      } if (!inProgress(game)) {
        throw new GameOverError()
      } if (!isSquareEmpty) {
        throw new SquareAlreadyMarkedError(squareId)
      } else {
        squares[squareId] = {...squares[squareId], moveState: moveStates.MOVE_PENDING}
      }
      return {...game, squares}
    case 'SERVER_DATA':
      debug( 'SERVER_DATA', action.state)
      return {...game, ...action.state}
    default:
      return game
  }
}


function ticTacToe(state, action) {
  return move(state, action)
}


// Components

const Square = ({mark = "", onClick, id, isMarkable, isMovePending = false}) => {
  return (
    <span
      className={"ticTacToeSquare" + (isMarkable ? " markable" : "") + (isMovePending ? " movePending" : "")}
      onClick={onClick}>{mark}</span>
  )
}

Square.propTypes = {
  id: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  mark: PropTypes.string,
  isMarkable: PropTypes.bool,
  isMovePending: PropTypes.bool
}

const SquareContainer = connect(
  (game, props) => {
    let square = game.squares[props.id]
    debug("connect", props.id, square)
    return {
      mark: square.mark,
      isMarkable: inProgress(game) &&
                  square.mark === "" &&
                  square.moveState === null &&
                  !movePending(game),
      isMovePending: square.moveState === moveStates.MOVE_PENDING }
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

const mapDispatchToProps = (dispatch, props) => {
  debug("mapDispatchToProps", props)
  return {
    onSquareClick: (id) => {
      debug("onSquareClick", id, props)
      dispatch(submitMove(id))
      dispatch(makeMove(id))
    }
  }
}

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
export {
  initialGameState,
  makeMove,
  movePending,
  moveStates,
  outcomes,
  players,
  submitMove,
  ticTacToe
}
