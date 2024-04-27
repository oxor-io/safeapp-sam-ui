import { FC, createContext, useContext, useEffect, useState } from 'react'
import { AbiItem, utf8ToHex, toBN } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import { useNetwork } from './networkContext'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import safeProxyFactory from '../contracts/SafeProxyFactory.json'
import safeModule from '../contracts/Safe.json'
import { TransactionStatus } from '@safe-global/safe-apps-sdk'
import { useZkWallet } from '../hooks/useProof'

type SamContextProps = {
  zkWalletAddress: string | null
  listOfOwners: string
  threshold: number
  root: string
  moduleEnabled: boolean
  createModule: (root: string, salt: string, listOfOwners: string, initThreshold: number, ownersArr: string[]) => Promise<void>
  enableModule: () => Promise<void>
  disableModule: () => Promise<void>
  executeTransaction: (to: string, value: string, data: string, operation: number, proofs: any[]) => Promise<void>
  fileSam: (newRoot: string, newThreshold: number, newListOfOwners: string) => Promise<void>
  getNonce: () => Promise<number>
}

const txParams = {
  safeTxGas: 1000000,
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

  const { saveZkWallet } = useZkWallet()

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

  // TODO: fix parameters amount
  const createModule = async (root: string, salt: string, listOfOwners: string, initThreshold: number, ownersArr: string[]) => {
    if (!web3 || !samContract || !safeProxyFactoryContract || !safeContract) {
      return
    }

    const initDataSAM = samContract.methods.setup(safe.safeAddress, root, initThreshold).encodeABI()

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
      params: txParams,
    })

    // Await for Safe transaction to be CONFIRMED to get txHash
    const safeTxDetails = await waitForTransactionConfirmation(createSamTx.safeTxHash)
    if (!safeTxDetails) {
      return
    }

    const txReceipt = await sdk.eth.getTransactionReceipt([safeTxDetails.txHash])

    const createdZkWalletAddress = txReceipt.logs[1].address

    setZkWalletAddress(createdZkWalletAddress)
    setZkWalletContract(new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], createdZkWalletAddress))
    setRoot(root)
    setListOfOwners(listOfOwners)
    setThreshold(initThreshold)

    await saveZkWallet({
      owners: ownersArr,
      root,
      address: createdZkWalletAddress,
    })
  }

  const waitForTransactionConfirmation = (safeTxHash: string): Promise<any | null> => {
    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const safeTransaction = await sdk.txs.getBySafeTxHash(safeTxHash)
        if (safeTransaction.txStatus === TransactionStatus.SUCCESS) {
          clearInterval(interval)
          resolve(safeTransaction)
        } else if (safeTransaction.txStatus === TransactionStatus.FAILED) {
          clearInterval(interval)
          resolve(null)
        }
      }, 3000) // Check every 3 seconds
    });
  };

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
      params: txParams,
    })

    setModuleEnabled(true)
  }

  const disableModule = async () => {
    if (!safeContract) {
      return
    }

    const disableModuleData = safeContract.methods.disableModule(zkWalletAddress, zkWalletAddress).encodeABI()
    await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: safe.safeAddress,
          data: disableModuleData,
        },
      ],
      params: txParams,
    })

    setModuleEnabled(false)
  }

  const fileSam = async (newRoot: string, newThreshold: number, newListOfOwners: string) => {
    if (!zkWalletContract || !zkWalletAddress) {
      return
    }

    const changeRoot = zkWalletContract.methods.file(
      utf8ToHex('root'),
      toBN(newRoot).toString()
    ).encodeABI()

    const changeThreshold = zkWalletContract.methods.file(
      utf8ToHex('threshold'),
      toBN(newThreshold).toString()
    ).encodeABI()

    await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: zkWalletAddress,
          data: changeRoot,
        },
        {
          value: '0',
          to: zkWalletAddress,
          data: changeThreshold,
        },
      ],
      params: txParams,
    })

    setThreshold(newThreshold)
    setRoot(newRoot)
    setListOfOwners(newListOfOwners)
  }

  const getNonce = async (): Promise<number> => {
    const nonce = Number(await zkWalletContract!.methods.getNonce().call({ from: safe.safeAddress }))

    return nonce
  }

  const executeTransaction = async (
    to: string,
    value: string,
    data: string,
    operation: number,
    proofs: any[],
  ) => {
    if (!zkWalletContract) {
      return
    }

    const executeTxData = zkWalletContract.methods.executeTransaction().encodeABI()
    await sdk.txs.send({
      txs: [
        {
          value: '0',
          to: safe.safeAddress,
          data: executeTxData,
        },
      ],
      params: txParams,
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
        executeTransaction,
        fileSam,
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
