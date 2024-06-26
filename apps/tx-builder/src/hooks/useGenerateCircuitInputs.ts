import { Element } from 'fixed-merkle-tree'
import { generateDataCircom } from '../scripts/generateInput'
import { useNetwork } from '../store'
import { AbiItem } from 'web3-utils'
import safeAnonymizationModule from '../contracts/SafeAnonymizationModule.json'

export interface GeneratorParameters {
  privKey: Uint8Array
  participantAddresses: string[]
  msgHash: string
}

export interface WitnessData {
  root: string
  pathElements: Element[]
  pathIndices: Element[]
  msgHash: string[]
  pubKey: [string[], string[]] // [pubKeyXAsChunks, pubKeyYAsChunks]
  r: string[]
  s: string[]
}

export const useGenerateCircuitInputs = () => {
  const { web3, safe } = useNetwork()

  const generateInputs = async (params: GeneratorParameters): Promise<WitnessData> => {
    const { privKey, participantAddresses, msgHash} = params

    const generatedInputs = await generateDataCircom(privKey, participantAddresses, msgHash, 5)

    return generatedInputs as WitnessData
  }

  const getMsgHash = async (
    to: string,
    value: string,
    data: string,
    operation: number,
    nonce: number,
    samAddress: string,
  ) => {
    if (!web3) {
      return
    }

    const samContract = new web3.eth.Contract(safeAnonymizationModule.abi as AbiItem[], samAddress)

    const msgHash = await samContract.methods.getMessageHash(to, value, data, operation, nonce).call({ from: safe.safeAddress })

    return msgHash
  }

  return { generateInputs, getMsgHash }
}
