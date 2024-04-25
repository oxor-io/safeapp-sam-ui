import { useState } from 'react'
import { WitnessData } from './useGenerateCircuitInputs'

export const useCircomProof = () => {
  const [zkProof, setZkProof] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const generateCircomProof = async (inputData: WitnessData) => {
    setIsLoading(true)
    try {
      // TODO: Replace ... with function for proof generating via Circom circuit
      // const proofData = ....

      // setProof(proofData)
      setIsLoading(false)
    } catch (error) {
      setError(error as Error)
      setIsLoading(false)
    }
  }

  return { zkProof, isLoading, error, generateCircomProof }
}
