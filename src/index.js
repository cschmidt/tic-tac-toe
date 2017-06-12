import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { initialGameState, ticTacToe } from './App'
import { publishAction } from './sns-middleware'
import App from './App'
import './index.css'

const store = createStore(ticTacToe, initialGameState, applyMiddleware(thunkMiddleware, publishAction))

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
