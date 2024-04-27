import { useState } from 'react'
import { WitnessData } from './useGenerateCircuitInputs'

const proveUrl = 'https://sam.oxor.io/prove'

export const useCircomProof = () => {
  const [zkProof, setZkProof] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  const generateCircomProof = async (inputData: WitnessData) => {
    setIsLoading(true)

    try {
      const response = await fetch(proveUrl, {
        method: 'POST',
        headers: {
          "Content-Type": 'application/json',
        },
        body: JSON.stringify(inputData),
      })

      setZkProof(await response.text())
      setIsLoading(false)
    } catch (error) {
      setError(error as Error)
      console.error(error)
      setIsLoading(false)
    }
  }

  return { zkProof, isLoading, error, generateCircomProof }
}
