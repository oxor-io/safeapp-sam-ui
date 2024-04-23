import { FC, useState } from 'react'
import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import { useNetwork } from '../store'

import { TextFieldInput } from '@gnosis.pm/safe-react-components'
import { useSam } from '../store/samContext'

const ModuleConfiguration: FC = () => {
  const [module, setModule] = useState(false)

  const {
    interfaceRepo,
    web3,
    chainInfo,
    safe,
    sdk,
  } = useNetwork()

  const {
    zkWalletAddress,
    listOfOwners,
    moduleEnabled,
    createModule,
    enableModule,
  } = useSam()


  const onModuleCreate = async () => {
    createModule()

    console.log("module created!")
    //   TODO
    setModule(true)
  }

  const onModuleEnable = () => {
    enableModule()
  }

  const onModuleUpdate = () => {
    // TODO
  }

  const onModuleDisable = () => {
    // TODO
  }

  return (
    <Wrapper>
      <StyledTitle size="lg">
        {!module ? 'Create ' : 'Edit '}
        ZK Wallet
      </StyledTitle>

      {zkWalletAddress && (
        <WalletAddressText size="lg">
          Safe ZK Wallet address:
          {' '}
          {zkWalletAddress}
        </WalletAddressText>
      )}

      <StyledTextFieldInput
        name="list-of-owners"
        label="List of owners"
        fullWidth
        multiline
        minRows={7}
        value={listOfOwners}
        variant="filled"
        // onChange={(event) => setListOfOwners(event.target.value)}
      />

      {module && (
        <TextFieldInput
          name="threshold"
          type="number"
          label="Threshold"
          value={safe.threshold}
        />
      )}

      <ButtonContainer>
        {!module ? (
          <Button
            onClick={onModuleCreate}
            size="lg"
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

const StyledTextFieldInput = styled(TextFieldInput)`
  margin-bottom: 2em;
`

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
`
