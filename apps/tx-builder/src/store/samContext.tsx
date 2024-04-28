import { FC, createContext, useContext, useEffect, useState } from 'react'
import { AbiItem, utf8ToHex, toBN, numberToHex } from 'web3-utils'
import { Contract } from 'web3-eth-contract'

import { useNetwork } from './networkContext'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'
import safeProxyFactory from '../contracts/SafeProxyFactory.json'
import safeModule from '../contracts/Safe.json'
import { TransactionStatus } from '@safe-global/safe-apps-sdk'
import { useZkWallet } from '../hooks/useZkWallet'
import { CircomProof } from '../hooks/useCircomProof'
import Web3 from 'web3'
import { BigNumber } from 'bignumber.js'

type SamContextProps = {
  zkWalletAddress: string | null
  listOfOwners: string[]
  threshold: number | null
  root: string
  moduleEnabled: boolean
  createModule: (root: string, salt: string, listOfOwners: string, initThreshold: number, ownersArr: string[]) => Promise<void>
  enableModule: () => Promise<void>
  disableModule: () => Promise<void>
  executeTransaction: (samAddress: string, executeTx: ExecuteTransaction) => Promise<void>
  fileSam: (newRoot: string, newThreshold: number, newListOfOwners: string[]) => Promise<void>
  getNonce: () => Promise<number>
}

interface ExecuteTransaction {
  to: string
  value: string
  data: string
  operation: number
  proofs: CircomProof[]
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

  const [listOfOwners, setListOfOwners] = useState<string[]>([])
  const [zkWalletAddress, setZkWalletAddress] = useState<string | null>(null)
  const [root, setRoot] = useState<string>('')
  const [threshold, setThreshold] = useState<number | null>(null)
  const [moduleEnabled, setModuleEnabled] = useState<boolean>(false)

  const { sdk, web3, safe } = useNetwork()

  const { saveZkWallet, get, removeZkWallet } = useZkWallet()

  useEffect(() => {
    get.byParam('safeWallet', safe.safeAddress)
      .then((res) => res.json())
      .then((walletArr) => {
        if (walletArr.length === 0) {
          return
        }

        const accountModule = walletArr[0]

        setZkWalletAddress(accountModule.address)
        setListOfOwners(accountModule.owners)
        setRoot(accountModule.root)
        setThreshold(accountModule.owners.length)
        setModuleEnabled(true)
      })
  }, [])

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
    setListOfOwners(ownersArr)
    setThreshold(initThreshold)

    await saveZkWallet({
      owners: ownersArr,
      root,
      address: createdZkWalletAddress,
      safeWallet: safe.safeAddress,
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

    await removeZkWallet(zkWalletAddress!)

    setModuleEnabled(false)
    setZkWalletAddress('')
    setRoot('')
    setThreshold(null)
    setListOfOwners([])
  }

  const fileSam = async (newRoot: string, newThreshold: number, newListOfOwners: string[]) => {
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
    samAddress: string,
    executeTx: ExecuteTransaction
  ) => {
    if (!web3) {
      return
    }

    const samTxContract = new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], samAddress)

    const {
      to,
      value,
      data,
      operation,
      proofs,
    } = executeTx

    /*
      struct Proof {
        uint256[2] _pA;
        uint256[2][2] _pB;
        uint256[2] _pC;
        uint256 commit;
      }
    */
    const proofsTuple = proofs.map((proof) => {
      return [
        proof.pi_a.slice(0, 2).map((item) => numberToHex(new BigNumber(item) as any)),
        proof.pi_b.slice(0, 2).map((item) => item.map((value) => numberToHex(new BigNumber(value) as any))),
        proof.pi_c.slice(0, 2).map((item) => numberToHex(new BigNumber(item) as any)),
        numberToHex(new BigNumber(proof.commit) as any),
      ]
    })


    const executeTxData = samTxContract
      .methods
      .executeTransaction(to, value, data, operation, proofsTuple)
      .encodeABI()

    // await sdk.txs.send({
    //   txs: [
    //     {
    //       value: '0',
    //       to: samAddress,
    //       data: executeTxData,
    //     },
    //   ],
    //   params: txParams,
    // })

    let externalWeb3 = new Web3(Web3.givenProvider)

    const fromAccount = safe.owners[0]
    const toAddress = samAddress
    const amountToSend = '0'

    // Build the transaction object
    const transactionObject = {
      from: fromAccount,
      to: toAddress,
      value: amountToSend,
      data: executeTxData,
    }

    // externalWeb3.eth.sendTransaction(transactionObject)
    //   .on('transactionHash', (hash) => {
    //     console.log('Transaction Hash:', hash);
    //   })
    //   .on('receipt', (receipt) => {
    //     console.log('Transaction Receipt:', receipt);
    //   })
    //   .on('error', (error) => {
    //     console.error('Transaction Error:', error);
    //   })
    //   .then(console.log)
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
