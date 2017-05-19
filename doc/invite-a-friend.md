# Invite a Friend

So here's where things get really interesting. I have the basics of async flow
working, but there are significant gaps to get to the point where you can play
with a friend:

- some sort of sign-in or identification mechanism
  - (Is this really needed, or could one get away with just being able to
     send a link to the game or something? That might work to start with
     anyway.)
- a way to share game state between two browsers
- a way to ensure players can only make their own moves (right now in local
  mode a single player makes all the moves)
- a way to share game state between two players
- possibly a way for other folks to watch a game between two players
- players can participate in multiple games (right now there's only one active,
  local game)
- player participation is limited to games they initiate, or games they are
  invited into


# Architecture


## Unalterables
- Adopts Reactive principles (see [The Reactive Manifesto](http://www.reactivemanifesto.org/))
- S3 for archival storage of historical games (what's a "historical" game?)
- Inspiration from CQRS and Event Sourcing

## Design Alternatives

### Design "A"
- DynamoDB for storage
- Lambda for compute
- SNS/SQS for IO

### Design "B"
- Elasticache/Redis for storage
- EC2 for compute
- HTTP for IO

### Design "C"
- S3 for storage
- Lambda for compute
- SNS/SQS for IO

## Analysis
### Criteria
- monitoring
- response times
- scalability
- complexity
- cost

### SNS/SQS for Communication
- Single SNS topic for submitting game actions
- SQS queue per player or session (likely session) for returning results

- how do retries work? limits on that?

- sample message format

        {
          "session": [token],
          "action": {}
        }

- can use SQS Queue MessageRetentionPeriod to enforce timeouts (down to 60
  seconds)


### S3 for storage

Path structure:

    /games/[game_id]/[file per action].json


Options for naming actions

- ```[action_name].json``` (i.e. /games/1F458832-B5DD-4C9A-8B3F-EAE4FC9A50D9/MAKE_MOVE.json)

Questions

- Can you setup permissions to enforce immutability of the game actions?
- How many API calls would it take to retrieve 'n' moves?

# Notes
- Consider using [Atlassian's LocalStack](https://github.com/atlassian/localstack)
  for dev mode.
