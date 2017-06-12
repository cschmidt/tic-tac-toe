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

So how much would it cost to use an SQS queue per client?

Every 1M SQS API requests costs $0.40:

https://aws.amazon.com/sqs/pricing/

The longest wait time you can have is 20 seconds:

http://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-long-polling.html

So, a single client connected for 8 hours would consume a minimum of 1440 API
calls.

8 * 60 * 60 / 20 = 1440

So for roughly $0.40 you can support 1M / 1440 = 694 concurrent clients.

This doesn't include message activity itself.

Further optimizations could be made by selectively backing off from long
polling depending on the needs of the application.
