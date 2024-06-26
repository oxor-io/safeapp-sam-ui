import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import { theme } from '@gnosis.pm/safe-react-components'
import { SafeProvider } from '@safe-global/safe-apps-react-sdk'
import { BrowserRouter } from 'react-router-dom'

import * as serviceWorker from './serviceWorker'

import AppLoader from './components/AppLoader'
import GlobalStyles from './global'
import App from './App'
import StoreProvider from './store'

ReactDOM.render(
  <>
    <GlobalStyles />
    <ThemeProvider theme={theme}>
      <SafeProvider loader={<AppLoader />}>
        <StoreProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StoreProvider>
      </SafeProvider>
    </ThemeProvider>
  </>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
