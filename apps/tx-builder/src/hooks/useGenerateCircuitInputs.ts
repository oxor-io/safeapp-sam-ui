import { useEffect, useState } from 'react'
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

  useEffect(() => {
    // TODO: Provide generateDataCircom function from
    // const generatedInputs = ...

    // setInputs(generatedInputs)
  }, [params]);

  return { inputs }
}

export default useGenerateCircuitInputs
