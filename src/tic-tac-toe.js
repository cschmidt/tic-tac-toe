'use strict'

export const players = {
  X: 'X',
  O: 'O'
}

export const outcomes = {
  UNKNOWN: 'UNKNOWN',
  WIN: 'WIN',
  DRAW: 'DRAW'
}

// Representations of all vertical, horizontal and diagonal lines
const lines = [
  ['a1', 'a2', 'a3'],
  ['b1', 'b2', 'b3'],
  ['c1', 'c2', 'c3'],
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  ['a1', 'b2', 'c3'],
  ['a3', 'b2', 'c1']
]


// Errors

export class GameOverError extends Error {
  constructor() {
    super('Game Over!')
  }
}

export class SquareAlreadyMarkedError extends Error {
  constructor(square) {
    super(`${square} is already marked`)
  }
}


export default class TicTacToe {
  constructor() {
    this.squares = {
      a1: { mark: '', moveState: null },
      a2: { mark: '', moveState: null },
      a3: { mark: '', moveState: null },
      b1: { mark: '', moveState: null },
      b2: { mark: '', moveState: null },
      b3: { mark: '', moveState: null },
      c1: { mark: '', moveState: null },
      c2: { mark: '', moveState: null },
      c3: { mark: '', moveState: null }
    }
    this.turn = players.X
    this.outcome = outcomes.UNKNOWN
    this.winningLine = null
    this.synopsis = ''
  }

  mark(square) {
    let isSquareEmpty = this.squares[square] && this.squares[square].mark === ''

    // mark the game board if the requested square is empty and the game is
    // still in play
    if (!this.inProgress()) {
      throw new GameOverError()
    }
    else if (!isSquareEmpty) {
      throw new SquareAlreadyMarkedError(square)
    }
    else {
      this.squares[square].mark = this.turn
      this.determineOutcome()
      // switch players if the game is still in play
      this.turn =
        this.outcome === outcomes.UNKNOWN ?
        (this.turn === players.X ? players.O : players.X) : this.turn
    }
    this.synopsis = this.produceSynopsis()
  }

  determineOutcome() {
    // See if there's a straight line of one mark (X's or O's), or if the board
    // is fully marked without a winner (a draw).
    let counts = { 'X': 0, 'O': 0, '': 0 }
    lines.forEach((line) => {
      line.forEach((square) => {
        counts[this.squares[square].mark]++
      })
      if (counts.X === 3 || counts.O === 3) {
        this.outcome = outcomes.WIN
        this.winningLine = line
      }
      // Reset X and O counts for next line (don't reset empty space count).
      counts.X = 0
      counts.O = 0
    })
    // If there are no empty squares, and we haven't already found a winner, we
    // must have a draw.
    if (this.outcome === outcomes.UNKNOWN && counts[''] === 0) {
      this.outcome = outcomes.DRAW
    }
  }

  inProgress() {
    return this.outcome === outcomes.UNKNOWN
  }

  produceSynopsis() {
    let synopsis = '?'
    switch (this.outcome) {
      case outcomes.UNKNOWN:
        this.synopsis = 'In Progress'
        break
      case outcomes.WIN:
        this.synopsis = `${this.turn} wins!`
        break
      case outcomes.DRAW:
        this.synopsis = 'Draw'
        break
    }
    return synopsis
  }
}
