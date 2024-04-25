import { FC, createContext, useContext, useEffect, useState } from 'react'
import { AbiItem, utf8ToHex, toBN, toChecksumAddress } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import { useNetwork } from './networkContext'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import safeProxyFactory from '../contracts/SafeProxyFactory.json'
import safeModule from '../contracts/Safe.json'

type SamContextProps = {
  zkWalletAddress: string | null
  listOfOwners: string
  threshold: number
  root: string
  moduleEnabled: boolean
  createModule: (root: string, salt: string) => Promise<void>
  enableModule: () => Promise<void>
  disableModule: () => Promise<void>
  changeRootWithOwners: (newRoot: string, newListOfOwners: string) => Promise<void>
  changeThreshold: (newThreshold: number) => void
  getNonce: () => void
}

export const SamContext = createContext<SamContextProps | null>(null)

const SamProvider: FC = ({ children }) => {
  const [safeProxyFactoryContract, setSafeProxyFactoryContract] = useState<Contract | null>(null)
  const [samContract, setSamContract] = useState<Contract | null>(null)
  const [safeContract, setSafeContract] = useState<Contract | null>(null)
  const [zkWalletContract, setZkWalletContract] = useState<Contract | null>(null)

  const [listOfOwners, setListOfOwners] = useState('')
  const [zkWalletAddress, setZkWalletAddress] = useState<string | null>(null)
  const [root, setRoot] = useState<string>('')
  const [threshold, setThreshold] = useState<number>(1)
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
  }, [web3, safe.safeAddress])

  const createModule = async (root: string, salt: string) => {
    if (!web3 || !samContract || !safeProxyFactoryContract || !safeContract) {
      return
    }

    const thresholdUint64 = toBN(threshold).toString()
    const initDataSAM = samContract.methods.setup(safe.safeAddress, root, thresholdUint64).encodeABI()

    const createProxyData = safeProxyFactoryContract
      .methods
      .createChainSpecificProxyWithNonce(safeAnonymizationModule.address, initDataSAM, salt)
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
        safeTxGas: 1000000,
      }
    })

    // FIXME: Check if previous logic is correct, now it seems that it's a random address
    const createdZkWalletAddress = toChecksumAddress('0x' + createSamTx.safeTxHash.slice(-40))

    setRoot(root)
    setZkWalletAddress(createdZkWalletAddress)
    setZkWalletContract(new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], createdZkWalletAddress))
  }

  const enableModule = async () => {
    if (!safeContract || !zkWalletAddress) {
      return
    }

    const enableModuleData = safeContract.methods.enableModule(zkWalletAddress).encodeABI()

    await sdk.txs.send({
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

    setModuleEnabled(true)
  }

  const disableModule = async () => {
    if (!safeContract) {
      return
    }

    // FIXME: wrong arguments
    const enableModuleData = safeContract.methods.disableModule(zkWalletAddress).encodeABI()
    await sdk.txs.send({
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

    setModuleEnabled(true)
  }

  const changeRootWithOwners = async (newRoot: string, newListOfOwners: string) => {
    await changeParameters('root', newRoot)
    setRoot(newRoot)
    setListOfOwners(newListOfOwners)
  }

  const changeThreshold = async (newThreshold: number) => {
    await changeParameters("threshold", newThreshold)
    setThreshold(newThreshold)
  }

  const getNonce = async () => {
    if (!zkWalletContract) {
      return
    }

    await zkWalletContract.methods.getNonce().call({ from: safe.safeAddress })
  }

  const changeParameters = async (what: 'root' | 'threshold', newValue: string | number) => {
    if (!samContract || !zkWalletAddress) {
      return
    }

    const whatBytes32 = utf8ToHex(what)
    const newValueUint256 = toBN(newValue).toString()

    const fileData = samContract.methods.file(
      whatBytes32,
      newValueUint256
    ).encodeABI()

    await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: zkWalletAddress,
          data: fileData,
        },
      ],
      params: {
        safeTxGas: 500000,
      }
    })
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
        disableModule,
        changeRootWithOwners,
        changeThreshold,
        getNonce,
      }}
    >
      { children }
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
