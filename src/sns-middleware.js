import AWS from 'aws-sdk'
import { config } from './config'
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
// const sqsQueueUrl = config.aws.queueUrlPlayer1

// Utility functions
const debug = (...args) => {
  if (DEBUG) console.log(...args)
}

// Errors
function NotConfiguredError(message) {
  this.message = message
  this.toString = () => {
    return this.message
  }
}

// Actions
const assignQueue = (queueUrl) => {
  return {
    type: 'ASSIGN_QUEUE',
    meta: { local: true },
    queueUrl
  }
}


// Reducers
const queues = (state = {}, action) => {
  debug('queues', state, action)
  switch (action.type) {
    case 'ASSIGN_QUEUE':
      return { ...state, queueUrl: action.queueUrl }
    default:
      return state
  }
}

const receiveMessages = (onMessageReceived, sqsQueueUrl) => {
  if (receiving) {
    return
  }
  else {
    receiving = true
    sqs.receiveMessage({
      QueueUrl: sqsQueueUrl,
      WaitTimeSeconds: 20,
      MaxNumberOfMessages: 10
    }, (err, data) => {
      if (err) {
        console.log('While receiving', err)
      }
      else {
        receiving = false
        data.Messages.forEach((message) => {
          // Push the id and handle onto a queue so we can delete it later
          receivedMessageHandles.push({
            Id: message.MessageId,
            ReceiptHandle: message.ReceiptHandle
          })
          let parsedBody = JSON.parse(message.Body)
          let bodyMessage = JSON.parse(parsedBody['Message'])
          onMessageReceived(bodyMessage)
        })
      }
    })
  }
}


const deleteMessages = (sqsQueueUrl) => {
  let Entries = []
  while (Entries.length < 10 && receivedMessageHandles.length > 0) {
    Entries.push(receivedMessageHandles.pop())
  }
  if (Entries.length > 0) {
    sqs.deleteMessageBatch({
      QueueUrl: sqsQueueUrl,
      Entries
    }, (err, data) => {
      if (err) {
        console.log('While deleting', err)
      }
      else {
        debug('Deleted', Entries.length, 'messages')
      }
    })
  }
}


const start = (store) => {
  if (!running) {
    debug('Starting')
    const queueUrl = store.getState().queues.queueUrl
    if (queueUrl === undefined) {
      throw new NotConfiguredError('No queueUrl found in store')
    }
    running = true
    setInterval(() => {
      receiveMessages((state) => {
        debug('Received', state)
        store.dispatch({ type: 'SERVER_DATA', state, meta: { local: true } })
      }, queueUrl)
    }, 20)
    setInterval(() => { deleteMessages(queueUrl) }, 2000)
    debug('Started')
  }
}


const publishAction = reducer => store => next => action => {
  if (action.meta && action.meta.local) {
    // if the action is marked for local processing, then do the state update
    // here on the client
    return next(action)
  }
  else {
    if (!running) start(store)
    // otherwise, get the next state from the reducer, and publish that state
    // which we'll fetch from an SQS message
    //FIXME: cannot know about ticTacToe!
    let stateUpdate = reducer(store.getState().ticTacToe, action)
    debug('Sending', action, stateUpdate)
    sns.publish({
      Message: JSON.stringify(stateUpdate),
      TopicArn: config.aws.topicArn
    }, (err, data) => { if (err) console.log(err) })
    // don't process the action locally
    return {}
  }
}


export { assignQueue, publishAction, queues, start }
