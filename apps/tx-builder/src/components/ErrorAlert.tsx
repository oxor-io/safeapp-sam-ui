import React from 'react'
import MuiAlert from '@material-ui/lab/Alert'
import MuiAlertTitle from '@material-ui/lab/AlertTitle'
import styled from 'styled-components'
import { useSam } from '../store/samContext'

const ErrorAlert = () => {
  const { errorMessage, setErrorMessage } = useSam()

  if (!errorMessage) {
    return null
  }

  return (
    <ErrorAlertContainer>
      <MuiAlert severity="error" onClose={() => setErrorMessage('')}>
        <MuiAlertTitle>{errorMessage}</MuiAlertTitle>
      </MuiAlert>
    </ErrorAlertContainer>
  )
}

const ErrorAlertContainer = styled.div`
  position: fixed;
  width: 100%;
  z-index: 10;
  background-color: transparent;
  height: 70px;
`

export default ErrorAlert
