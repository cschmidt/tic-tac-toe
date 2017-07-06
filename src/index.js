import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { combineReducers, createStore, compose, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { ticTacToe } from './App'
import { assignQueue, queues, publishAction } from './sns-middleware'
import App from './App'
import './index.css'
import {config} from './config'

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store =
  createStore(
    combineReducers({ticTacToe, queues}),
    undefined,
    composeEnhancers(applyMiddleware(thunkMiddleware, publishAction(ticTacToe))))


render(
  <div>
    <Provider store={store}>
      <App />
    </Provider>
    <div style={{textAlign: 'center'}}>
      <button name="Player 1"
        onClick={() => store.dispatch(assignQueue(config.aws.queueUrlPlayer1))}>Player 1</button>
      <button name="Player 2"
        onClick={() => store.dispatch(assignQueue(config.aws.queueUrlPlayer2))}>Player 2</button>
    </div>
  </div>,
  document.getElementById('root')
)
