import { useState } from 'react'
import { WitnessData } from './useGenerateCircuitInputs'
import { jsonStringifyWithBigInt } from '../scripts/common/utils'

const proveUrl = 'https://sam.oxor.io/prove'

export interface CircomProof {
  pi_a: string[]
  pi_b: string[][]
  pi_c: string[]
  protocol: string
  curve: string
  commit: string
}

export const useCircomProof = () => {
  const [zkProof, setZkProof] = useState<CircomProof | null>()
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
        body: jsonStringifyWithBigInt(inputData),
      })

      setZkProof(await response.json())
      setIsLoading(false)
    } catch (error) {
      setError(error as Error)
      console.error(error)
      setIsLoading(false)
    }
  }

  return { zkProof, isLoading, error, generateCircomProof }
}
