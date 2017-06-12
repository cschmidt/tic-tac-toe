import AWS from 'aws-sdk'
import {config} from './config'
import * as _ from 'underscore'

// SNS Middleware allows you to intercept Redux actions you specify, and publish
// them to an SNS topic.


const DEBUG = true
var running = false
var receiving = false
var receivedMessageHandles = []

const awsOptions = {
  region: config.aws.region,
  credentials: new AWS.Credentials(config.aws.accessKey, config.aws.secretAccessKey)
}

const sns = new AWS.SNS(awsOptions)
const sqs = new AWS.SQS(awsOptions)

// Utility functions
const debug = (...args) => {
  if (DEBUG) console.log(...args)
}


const receiveMessages = (onMessageReceived) => {
  if (receiving) {
    return
  } else {
    receiving = true
    sqs.receiveMessage({
        QueueUrl: config.aws.queueUrl,
        WaitTimeSeconds: 20,
        MaxNumberOfMessages: 10
      }, (err, data) => {
        if (err) {
          console.log('While receiving', err)
        } else {
          receiving = false
          debug("Received", data.Messages.length, "messages")
          data.Messages.forEach((message) => {
            // Push the id and handle onto a queue so we can delete it later
            receivedMessageHandles.push({Id: message.MessageId,
                                         ReceiptHandle: message.ReceiptHandle})
            let parsedBody = JSON.parse(message.Body);
            let bodyMessage = JSON.parse(parsedBody['Message'])
            onMessageReceived(bodyMessage)
          })
        }
      }
    )
  }
}


const deleteMessages = () => {
  let Entries = []
  while (Entries.length < 10 && receivedMessageHandles.length > 0) {
    Entries.push(receivedMessageHandles.pop())
  }
  if (Entries.length > 0) {
    sqs.deleteMessageBatch({
        QueueUrl: config.aws.queueUrl,
        Entries
    }, (err, data) => {
      if (err) {
        console.log('While deleting', err)
      } else {
        debug('Deleted', Entries.length, 'messages')
      }
    })
  }
}


const start = () => {
  if (!running) {
    running = true
    setInterval(() => {
      receiveMessages((message) => {
        console.log('Received', message)
      })
    }, 20)
    setInterval(deleteMessages, 2000)
  }
}


const publishAction = store => next => action => {
  if (!running) start()
  debug('Sending', action)
  sns.publish({
    Message: JSON.stringify(action),
    TopicArn: config.aws.topicArn
  }, (err, data) => {if (err) console.log(err)})
  let result = next(action)
  return result
}


export {publishAction}
