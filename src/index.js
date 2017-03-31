import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { initialGameState, ticTacToe } from './App'
import App from './App'
import './index.css'

const store = createStore(ticTacToe, initialGameState)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
