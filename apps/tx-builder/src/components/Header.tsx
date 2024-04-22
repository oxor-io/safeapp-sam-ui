import { Text } from '@gnosis.pm/safe-react-components'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import {
  DASHBOARD_PATH,
  HOME_PATH, REVIEW_AND_CONFIRM_PATH, TRANSACTION_LIBRARY_PATH,
} from '../routes/routes'
import ChecksumWarning from './ChecksumWarning'
import ErrorAlert from './ErrorAlert'

const Header = () => {
  return (
    <>
      <HeaderWrapper>
        <StyledLink to={HOME_PATH}>
          <Text size="xl">
            ZK Wallet
          </Text>
        </StyledLink>

        {/*<StyledLink to={DASHBOARD_PATH}>*/}
        {/*  <Text size="xl">*/}
        {/*    TX Builder dashboard*/}
        {/*  </Text>*/}
        {/*</StyledLink>*/}


        <StyledLink to={DASHBOARD_PATH}>
          <Text size="sm">
            New
          </Text>
        </StyledLink>
        <StyledLink to={REVIEW_AND_CONFIRM_PATH}>
          <Text size="sm">
            Pending
          </Text>
        </StyledLink>
        <StyledLink to={TRANSACTION_LIBRARY_PATH}>
          <Text size="sm">
            Confirmed
          </Text>
        </StyledLink>
      </HeaderWrapper>
      <ErrorAlert />
      <ChecksumWarning />
    </>
  )
}

export default Header

const HeaderWrapper = styled.header`
  position: fixed;
  width: 100%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e2e3e3;
  z-index: 10;
  background-color: white;
  height: 70px;
  padding: 0 40px;
  box-sizing: border-box;
  gap: 40px;
`

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 16px;
  text-decoration: none;
`
