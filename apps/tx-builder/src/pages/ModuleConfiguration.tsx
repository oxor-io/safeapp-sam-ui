import { FC, useState, useEffect } from 'react'
import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import { TextFieldInput } from '@gnosis.pm/safe-react-components'
import { useSam } from '../store/samContext'
import { soliditySha3, keccak256 } from 'web3-utils'
import { generateTree } from '../scripts/merkleTree'
import { useNetwork } from '../store'
import { numberToHex } from 'web3-utils'

const ModuleConfiguration: FC = () => {
  const {
    zkWalletAddress,
    listOfOwners,
    moduleEnabled,
    createModule,
    enableModule,
    disableModule,
    fileSam,
    setErrorMessage,
  } = useSam()
  const { safe, web3} = useNetwork()

  const [localListOfOwners, setLocalListOfOwners] = useState<string>(listOfOwners.join(', '))

  useEffect(() => {
    setLocalListOfOwners(listOfOwners.join(', '))
  }, [listOfOwners])

  const onModuleCreate = async () => {
    if (!web3) {
      return
    }

    const blockNumber = await web3.eth.getBlockNumber()
    const owners = getArrayFromOwners()

    try {
      const { tree: {root} } = await generateTree(5, owners)

      const salt = soliditySha3({
        type: 'uint256',
        value: keccak256(numberToHex(root.toString()) + safe.safeAddress + blockNumber),
      }) as string

      await createModule(root.toString(), salt, localListOfOwners, owners.length, owners)
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message)
      }
    }
  }

  const onModuleEnable = async () => {
    await enableModule()
  }

  const onModuleUpdate = async () => {
    const owners = getArrayFromOwners()

    try {
      const { tree: {root} } = await generateTree(5, owners)

      await fileSam(root.toString(), owners.length, owners)
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message)
      }
    }
  }

  const onModuleDisable = async () => {
    await disableModule()
  }

  const getArrayFromOwners = (): string[] => {
    return localListOfOwners
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '')
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
        disabled={!moduleEnabled && !!zkWalletAddress}
        onChange={(event) => setLocalListOfOwners(event.target.value)}
      />

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
                disabled={listOfOwners.join(', ') === localListOfOwners}
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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
`
