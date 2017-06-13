import AWS from 'aws-sdk'
import {config} from './config'
import * as _ from 'underscore'

// SNS Middleware allows you to intercept Redux actions you specify, and publish
// them to an SNS topic.


const DEBUG = false
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
          data.Messages.forEach((message) => {
            // Push the id and handle onto a queue so we can delete it later
            receivedMessageHandles.push({Id: message.MessageId,
                                         ReceiptHandle: message.ReceiptHandle})
            let parsedBody = JSON.parse(message.Body)
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


const start = (store) => {
  if (!running) {
    running = true
    setInterval(() => {
      receiveMessages((state) => {
        debug('Received', state)
        store.dispatch({type: 'SERVER_DATA', state, meta: {local: true}})
      })
    }, 20)
    setInterval(deleteMessages, 2000)
  }
}


const publishAction = reducer => store => next => action => {
  if (!running) start(store)
  if (action.meta && action.meta.local) {
    // if the action is marked for local processing, then do the state update
    // here on the client
    return next(action)
  } else {
    // otherwise, get the next state from the reducer, and publish that state
    // which we'll fetch from an SQS message
    let stateUpdate = reducer(store.getState(), action)
    debug('Sending', action)
    sns.publish({
      Message: JSON.stringify(stateUpdate),
      TopicArn: config.aws.topicArn
    }, (err, data) => {if (err) console.log(err)})
    // don't process the action locally
    return {}
  }
}


export {publishAction}
