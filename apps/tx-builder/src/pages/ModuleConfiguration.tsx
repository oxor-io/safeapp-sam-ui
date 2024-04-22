import { FC, useEffect, useState } from 'react'
import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import { useNetwork } from '../store'

import { AbiItem } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import safeProxyFactory from '../contracts/SafeProxyFactory.json'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import { TextFieldInput } from '@gnosis.pm/safe-react-components'

const ModuleConfiguration: FC = () => {
  const [module, setModule] = useState(false)
  const [moduleEnabled, setModuleEnabled] = useState(false)

  const [listOfOwners, setListOfOwners] = useState('')

  const [safeProxyFactoryContract, setSafeProxyFactoryContract] = useState<Contract | null>(null)
  const [safeAnonymizationModuleContract, setSafeAnonymizationModuleContract] = useState<Contract | null>(null)

  const {
    interfaceRepo,
    web3,
    chainInfo,
    safe,
    sdk,
  } = useNetwork()

  useEffect(() => {
    if (!web3) {
      return
    }

    const proxyFactoryContract = new web3.eth.Contract(safeProxyFactory.abi as AbiItem[], safeProxyFactory.address)
    setSafeProxyFactoryContract(proxyFactoryContract)

    const samContract = new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], safeAnonymizationModule.address)
    setSafeAnonymizationModuleContract(samContract)
  }, [web3])

  useEffect(() => {
    setListOfOwners(safe.owners.toString())
  }, []);


  const onModuleCreate = async () => {
    if (!safeAnonymizationModuleContract) {
      return
    }

    // sdk.txs.send({
    //   txs: [
    //     {
    //       value: '0',
    //       to: safeProxyFactory.address,
    //       data: safeAnonymizationModuleContract.methods["setup"](safe.safeAddress, defaultRoot, 1).encodeABI(),
    //     },
    //   ],
    // })

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
        {!module ? 'Create ' : 'Edit '}
        ZK Wallet
      </StyledTitle>

      <WalletAddressText size="lg">
        Safe ZK Wallet address:
        {' '}
        {safe.safeAddress}
      </WalletAddressText>

      <StyledTextFieldInput
        name="list-of-owners"
        label="List of owners"
        fullWidth
        minRows={7}
        value={listOfOwners}
        variant="filled"
        onChange={(event) => setListOfOwners(event.target.value)}
        multiline
      />

      {module && (
        <TextFieldInput
          name="threshold"
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
