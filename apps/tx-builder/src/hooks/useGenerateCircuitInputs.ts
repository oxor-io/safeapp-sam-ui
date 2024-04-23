import { useState } from 'react'
import { Element } from 'fixed-merkle-tree'

export interface GeneratorParameters {
  privKey: string
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

const useGenerateCircuitInputs = (params: GeneratorParameters) => {
  const [inputs, setInputs] = useState<WitnessData | null>(null)


  const generateInputs = () => {
    // TODO: add scripts for generating circom inputs here
    // const generatedInputs = ...

    // setInputs(generatedInputs)
  }


  return { inputs, generateInputs }
}

export default useGenerateCircuitInputs
