import { useState } from 'react'
import { WitnessData } from './useGenerateCircuitInputs'

const useCircomProof = () => {
  const [proof, setProof] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const generateCircomProof = async (inputData: WitnessData) => {
    setLoading(true)
    try {
      // TODO: Replace null with function for proof generating via Circom circuit
      const proofData = null

      setProof(proofData)
      setLoading(false)
    } catch (error) {
      setError(error as Error)
      setLoading(false)
    }
  }

  return { proof, loading, error, generateCircomProof }
}

export default useCircomProof
