import { Element } from 'fixed-merkle-tree'

export interface GeneratorParameters {
  privKey: Uint8Array
  participantAddresses: string[]
  msgHash: string
  treeHeight: number
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
    // TODO: Provide generateDataCircom function here
    // const generatedInputs = ...

    // return generatedInputs

    // TODO: remove it, when upper TODO will be resolved
    return null as any
  }

  return { generateInputs }
}
