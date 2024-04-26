import { Element } from 'fixed-merkle-tree'
import { generateDataCircom } from '../scripts/generateInput'

export interface GeneratorParameters {
  privKey: Uint8Array
  participantAddresses: string[]
  msgHash: string
}

export interface WitnessData {
  root: string
  pathElements: Element[]
  pathIndices: Element[]
  msgHash: string
  pubKey: [string, string] // [pubKeyXAsChunks, pubKeyYAsChunks]
  r: string
  s: string
}

export const useGenerateCircuitInputs = () => {
  const generateInputs = async (params: GeneratorParameters): Promise<WitnessData> => {
    const { privKey, participantAddresses, msgHash} = params

    const generatedInputs = await generateDataCircom(privKey, participantAddresses, msgHash, 5)

    return generatedInputs as WitnessData
  }

  return { generateInputs }
}
