import { useEffect, useState } from 'react'

import { ProposedTransaction, SamTransaction } from '../typings/models'

const REACT_APP_SUPABASE_URL = "https://snsoupmxxcbdyohaeeny.supabase.co"
const REACT_APP_SUPABASE_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc291cG14eGNiZHlvaGFlZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTM2MzEsImV4cCI6MjAyOTQ2OTYzMX0.v8BGP1LFm1siAYXC7QYobH9bJ0y-tnzVMCqJkhOF4Eg"

type ProofsParams = 'id' | 'proofs' | 'root' | 'address'
export const useProofs = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [proofs, setProofs] = useState<SamTransaction[]>([])

  useEffect(() => {
    fetchProofs()
  }, [])

  const fetchProofs = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/proofs`, {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "apiKey": REACT_APP_SUPABASE_KEY ?? '',
          Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
        },
      })
      const json = await response.json()
      setProofs(json)
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const saveProof = async (transaction: ProposedTransaction) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/proofs`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(transaction),
    })
  }

  const updateProof = async (transaction: Partial<ProposedTransaction>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/proofs?id=eq.${transaction.id}`, {
      method: 'UPDATE',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(transaction),
    })
  }

  const removeProof = async (transaction: Pick<ProposedTransaction, 'id'>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/proofs?id=eq.${transaction.id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })
  }


  const fetchProofByParam = async (param: ProofsParams, value: string) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions?${param}=eq.${value}&select=*`, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })
  }

  return {
    proofs,
    isLoading,
    get: {all: fetchProofs(), byParam: fetchProofByParam},
    saveProof,
    updateProof,
    removeProof
  }
}
