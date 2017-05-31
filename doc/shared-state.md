# Thinking Out Loud
I want some actions to be submitted to the server via SNS, and some reducers
to run on the server and return updated state via SQS. Sounds like I need to
dig into Redux middleware a bit.

Some reducers would best be run on the server, and some would best be run on the
client. What differentiates between these cases? Is there a deterministic rule
we can use for this?

If we're going to transport large state updates from the server, what does that
look like in terms of performance? In fact, overall, would be good to benchmark
Redux updates. In particular, could consider this in the context of our POM, and
the extent to which Redux would be performant.

How do event sourcing and CQRS play out in this model?

One of the advantages of the SNS/SQS model is the ability to instrument the
message stream for other purposes. Think about how responses can be instrumented.
Perhaps we need a response SNS topic.
