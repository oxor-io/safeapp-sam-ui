import { FC, useState } from 'react'
import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

const ModuleConfiguration: FC = () => {
  const [module, setModule] = useState(false)
  const [moduleEnabled, setModuleEnabled] = useState(false)

  const [listOfOwners, setListOfOwners] = useState('')

  const onModuleCreate = () => {
    console.log("module created!")
    //   TODO
    setModule(true)
  }

  const onModuleEnable = () => {
    setModuleEnabled(true)
    // TODO
  }

  const onModuleUpdate = () => {
    // TODO
  }

  const onModuleDisable = () => {
    setModuleEnabled(false)
    // TODO
  }

  return (
    <Wrapper>
      <StyledTitle size="lg">
        {/* TODO: set dynamic title */}
        Create ZK Wallet
      </StyledTitle>

      <WalletAddressText size="lg">
        Safe ZK Wallet address: "Address"
      </WalletAddressText>

      <Text size="md">
        List of owners
      </Text>

      <ListOfOwners>
        {listOfOwners}
      </ListOfOwners>

      <ButtonContainer>
        {!module ? (
          <Button
            onClick={onModuleCreate}
            size="md"
            color="primary"
          >
            Create Module
          </Button>
        ) : (
          !moduleEnabled ? (
            <Button
              onClick={onModuleEnable}
              size="md"
              color="primary"
              variant="bordered"
            >
              Enable Module
            </Button>
          ) : (
            <>
              <Button
                onClick={onModuleUpdate}
                size="md"
                color="secondary"
                variant="bordered"
              >
                Update Module
              </Button>

              <Button
                onClick={onModuleDisable}
                size="md"
                color="error"
                variant="bordered"
              >
                Disable Module
              </Button>
            </>
          )
        )}
      </ButtonContainer>
    </Wrapper>
  )
}

export default ModuleConfiguration

const Wrapper = styled.main`
  && {
    padding: 120px 48px 48px;
    max-width: 750px;
    margin: 0 auto;
  }
`

const StyledTitle = styled(Title)`
  margin-top: 0;
  margin-bottom: 0.5em;
`

const WalletAddressText = styled(Text)`
  margin-bottom: 2em;
`

const ListOfOwners = styled.div`
  border: 1px solid #000000;
  background-color: #696969;
  min-height: 250px;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
`
