import { Text } from '@gnosis.pm/safe-react-components'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import {
  DASHBOARD_PATH,
  HOME_PATH,
  REVIEW_AND_CONFIRM_PATH,
  CONFIRMED_PATH,
} from '../routes/routes'
import { useSam } from '../store/samContext'
import ChecksumWarning from './ChecksumWarning'
import ErrorAlert from './ErrorAlert'

const Header = () => {
  const { root, threshold, moduleEnabled } = useSam()

  return (
    <>
      <HeaderWrapper>
        <StyledNav>
          <StyledLink to={HOME_PATH}>
            <Text size="xl">
              ZK Wallet
            </Text>
          </StyledLink>

          { !moduleEnabled && (
            <>
              <StyledLink to={DASHBOARD_PATH}>
                <Text size="xl">
                  New
                </Text>
              </StyledLink>
              <StyledLink to={REVIEW_AND_CONFIRM_PATH}>
                <Text size="xl">
                  Pending
                </Text>
              </StyledLink>
              <StyledLink to={CONFIRMED_PATH}>
                <Text size="xl">
                  Confirmed
                </Text>
              </StyledLink>
            </>
          ) }
        </StyledNav>

        { (threshold && root) && (
          <StyledDiv>
            <Text size="sm">
              Root:
              {' '}
              {root}
            </Text>

            <Text size="sm">
              Threshold:
              {' '}
              {threshold}
            </Text>
          </StyledDiv>
        )}
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
  justify-content: space-between;
  border-bottom: 1px solid #e2e3e3;
  z-index: 10;
  background-color: white;
  height: 70px;
  padding: 0 40px;
  box-sizing: border-box;
  gap: 40px;
`

const StyledNav = styled.nav`
  display: flex;
  flex-direction: row;
  gap: 40px;
`

const StyledDiv = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;

  & p {
    display: inline;
  }
`

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 16px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
