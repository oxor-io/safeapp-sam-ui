import { Element } from 'fixed-merkle-tree'
import { keccak256 } from 'web3-utils'
import { generateDataCircom } from '../scripts/generateInput'
import { useNetwork } from '../store'

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
  const { web3 } = useNetwork()

  const generateInputs = async (params: GeneratorParameters): Promise<WitnessData> => {
    const { privKey, participantAddresses, msgHash} = params

    const generatedInputs = await generateDataCircom(privKey, participantAddresses, msgHash, 5)

    return generatedInputs as WitnessData
  }

  const getMsgHash = (
    to: string,
    value: string,
    data: string,
    operation: number,
    nonce: number,
    samAddress: string,
    chainId: string,
  ) => {
    const callDataHash = keccak256(data)

    return keccak256(web3!.eth.abi.encodeParameters(
      ['address', 'uint256', 'bytes', 'ISafe.Operation', 'uint256', 'address', 'uint256'],
      [to, value, callDataHash, operation, nonce, samAddress, chainId]
    ))
  }


  return { generateInputs, getMsgHash }
}
