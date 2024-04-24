import { FC, createContext, useContext, useEffect, useState } from 'react'
import { AbiItem, utf8ToHex, toBN } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import { useNetwork } from './networkContext'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import safeProxyFactory from '../contracts/SafeProxyFactory.json'
import safeModule from '../contracts/Safe.json'

type SamContextProps = {
  zkWalletAddress: string | null
  listOfOwners: string
  threshold: number | null
  root: string| null
  moduleEnabled: boolean
  createModule: () => void
  enableModule: () => void
}

export const SamContext = createContext<SamContextProps | null>(null)

const SamProvider: FC = ({ children }) => {
  const [safeProxyFactoryContract, setSafeProxyFactoryContract] = useState<Contract | null>(null)
  const [samContract, setSamContract] = useState<Contract | null>(null)
  const [safeContract, setSafeContract] = useState<Contract | null>(null)

  const [listOfOwners, setListOfOwners] = useState('')
  const [zkWalletAddress, setZkWalletAddress] = useState<string | null>(null)
  const [root, setRoot] = useState<string | null>(null)
  const [threshold, setThreshold] = useState<number | null>(null)
  const [moduleEnabled, setModuleEnabled] = useState<boolean>(false)

  const { sdk, web3, safe } = useNetwork()

  useEffect(() => {
    if (!web3) {
      return
    }

    // Contracts initialization
    const proxyFactoryContract = new web3.eth.Contract(safeProxyFactory.abi as AbiItem[], safeProxyFactory.address)
    setSafeProxyFactoryContract(proxyFactoryContract)

    const initSamContract = new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], safeAnonymizationModule.address)
    setSamContract(initSamContract)

    const initSafeContract = new web3.eth.Contract(safeModule.abi as AbiItem[], safe.safeAddress)
    setSafeContract(initSafeContract)
  }, [web3])

  const createModule = async () => {
    if (!web3 || !samContract || !safeProxyFactoryContract || !safeContract) {
      return
    }

    // TODO: provide real root
    const testRoot = '7378323513472991738372527896654445137493089583233093119951646841738120031371'
    const testSalt = toBN('7777').toString()
    const threshold = toBN(1).toString()

    const initDataSAM = samContract.methods.setup(safe.safeAddress, testRoot, threshold).encodeABI()
    const createProxyData = safeProxyFactoryContract
      .methods
      .createChainSpecificProxyWithNonce(safeAnonymizationModule.address, initDataSAM, testSalt)
      .encodeABI()

    const createSamTx = await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: safeProxyFactory.address,
          data: createProxyData,
        },
      ],
      params: {
        safeTxGas: 500000,
      }
    })

    // TODO: Get address from previous transaction and set it to state
    // setZkWalletAddress()
  }

  const enableModule = async () => {
    if (!safeContract) {
      return
    }

    const enableModuleData = safeContract.methods.enableModule(zkWalletAddress).encodeABI()

    const moduleEnableTx = await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: safe.safeAddress,
          data: enableModuleData,
        },
      ],
      params: {
        safeTxGas: 1000000,
      }
    })
  }

  const changeParameters = (what: 'root' | 'threshold', newValue: string | number) => {
    if (!samContract) {
      return
    }

    const whatBytes32 = utf8ToHex(what)
    const newValueUint256 = toBN(newValue).toString()

    const fileData = samContract.methods.file(
      whatBytes32,
      newValueUint256
    ).encodeABI()

    // TODO: set up sending fileData to the SAM contract correctly
    // sdk.txs.send()
  }

  return (
    <SamContext.Provider
      value={{
        zkWalletAddress,
        listOfOwners,
        root,
        threshold,
        moduleEnabled,
        createModule,
        enableModule,
      }}
    >
      {children}
    </SamContext.Provider>
  )
}

export const useSam = () => {
  const contextValue = useContext(SamContext)
  if (contextValue === null) {
    throw new Error('Component must be wrapped with <SamProvider>')
  }

  return contextValue
}

export default SamProvider
