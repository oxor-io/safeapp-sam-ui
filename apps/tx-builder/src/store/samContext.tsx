import { FC, createContext, useContext, useEffect, useState } from 'react'
import { AbiItem, utf8ToHex, toBN } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import { useNetwork } from './networkContext'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import safeProxyFactory from '../contracts/SafeProxyFactory.json'

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
  }, [web3])

  const createModule = async () => {
    if (!web3 || !samContract) {
      return
    }

    const testRoot = '7378323513472991738372527896654445137493089583233093119951646841738120031371'
    const testSalt = '7777'

    const setupMessage = samContract.methods.setup(safe.safeAddress, testRoot, testSalt).encodeABI()

    const tx = await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: safeAnonymizationModule.address,
          data: setupMessage,
        },
      ],
      params: {
        safeTxGas: 500000,
      }
    })
  }

  const enableModule = () => {
    // TODO
  }

  const changeParameters = (what: 'root' | 'threshold', newValue: string | number) => {
    if (!samContract) {
      return
    }

    const whatBytes32 = utf8ToHex(what)
    const newValueUint256 = toBN(newValue)

    const fileMessage = samContract.methods.file(
      whatBytes32,
      newValueUint256
    ).encodeABI()

    // TODO: set up sending fileMessage to the SAM contract correctly
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
