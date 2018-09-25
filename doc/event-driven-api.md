# URL Endpoints
## /commands
Used to submit commands to the system
### POST
You post commands as JSON. Examples include:

    start_game

    make_move: {
      game_id: "[game_id]",
      number: 1,
      mark: "X"
    }

    get_game?

    list_games?

## /games
### GET
Get a (paginated) list of all games


## /games/[game_id]
### GET
Gets the state of a particular game

    board: [
      ["","",""],
      ["","",""],
      ["","",""]
    ],
    moves: [
      {square: "a1", mark: "X"},
      {square: "b2", mark: "O"}
    ],
    turn: "X",
    outcome: "UNKNOWN",
    winningLine: null

# Storage Implementation
Would be awesome if we can only use S3 and avoid the complexity of a database!

# Questions
## Should all interaction be event-driven? What about read requests?
Event-driven
Pros
- provides a complete record of all requests (including reads!), great for ML

Cons
- responses limited by messaging system max message size

## Should the shape of the responses (i.e. the game state) take into consideration
the needs of the client?

React/Redux encourages an id for each component, so rather than an array shaped
like a tic-tac-toe board, you'd more likely want a hash, with square ids as
keys.

