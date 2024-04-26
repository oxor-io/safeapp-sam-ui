import { useState } from 'react'
import { WitnessData } from './useGenerateCircuitInputs'

const apiUrl = 'http://sam.oxor.io/prove'

export const useCircomProof = () => {
  const [zkProof, setZkProof] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const generateCircomProof = async (inputData: WitnessData) => {
    setIsLoading(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json',
        },
        body: JSON.stringify(inputData),
      })

      setZkProof(await response.json())
      setIsLoading(false)
    } catch (error) {
      setError(error as Error)
      setIsLoading(false)
    }
  }

  return { zkProof, isLoading, error, generateCircomProof }
}
