import { FC, useState } from 'react'
import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import { TextFieldInput } from '@gnosis.pm/safe-react-components'
import { useSam } from '../store/samContext'
import { soliditySha3, keccak256 } from 'web3-utils'

const ModuleConfiguration: FC = () => {
  const {
    zkWalletAddress,
    threshold,
    listOfOwners,
    moduleEnabled,
    createModule,
    enableModule,
    disableModule,
    changeRootWithOwners,
    changeThreshold,
  } = useSam()

  const [localListOfOwners, setLocalListOfOwners] = useState<string>(listOfOwners)
  const [localThreshold, setLocalThreshold] = useState<number>(threshold)

  const onModuleCreate = async () => {
    const testRoot = '7378323513471991738332527896654445137493089583233093119951646841738120031371'
    const testSalt = soliditySha3({
      type: 'uint256',
      value: keccak256('7777'),
    }) as string

    await createModule(testRoot, testSalt)
  }

  const onModuleEnable = async () => {
    await enableModule()
  }

  const onModuleUpdate = () => {
    if (listOfOwners !== localListOfOwners) {
      onListOfOwnersUpdate(localListOfOwners)
    }

    if (threshold !== localThreshold) {
      changeThreshold(localThreshold)
    }
  }

  const onListOfOwnersUpdate = async (newListOfOwners: string) => {
    // TODO: add calculateRoot method
    const calculatedRoot = ''

    await changeRootWithOwners(calculatedRoot, newListOfOwners)
  }

  const onModuleDisable = async () => {
    await disableModule()
  }

  return (
    <Wrapper>
      <StyledTitle size="lg">
        {!zkWalletAddress ? 'Create ' : 'Edit '}
        ZK Wallet
      </StyledTitle>

      {zkWalletAddress && (
        <WalletAddressText size="lg">
          Safe ZK Wallet address:
          {' '}
          {zkWalletAddress}
        </WalletAddressText>
      )}

      <TextFieldInput
        name="list-of-owners"
        label="List of owners"
        fullWidth
        multiline
        minRows={7}
        value={localListOfOwners}
        variant="filled"
        onChange={(event) => setLocalListOfOwners(event.target.value)}
      />

      {zkWalletAddress && (
        <TextFieldInput
          style={{ marginTop: '2rem' }}
          name="threshold"
          type="number"
          label="Threshold"
          value={localThreshold}
          onChange={(event) => setLocalThreshold(Number(event.target.value))}
        />
      )}

      <ButtonContainer>
        {!zkWalletAddress ? (
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
                disabled
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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
`
