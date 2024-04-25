import { useEffect, useState } from 'react'

import { ProposedTransaction, SamTransaction } from '../typings/models'

const REACT_APP_SUPABASE_URL = "https://snsoupmxxcbdyohaeeny.supabase.co"
const REACT_APP_SUPABASE_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc291cG14eGNiZHlvaGFlZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTM2MzEsImV4cCI6MjAyOTQ2OTYzMX0.v8BGP1LFm1siAYXC7QYobH9bJ0y-tnzVMCqJkhOF4Eg"

type TransactionParams = 'id' | 'contractInterface' | 'description' | 'raw' | 'nonce' | 'proofs' | 'confirmed' | 'address' | 'root'
export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<SamTransaction[]>([])

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions`, {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "apiKey": REACT_APP_SUPABASE_KEY ?? '',
          Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
        },
      })
      const json = await response.json()
      setTransactions(json)
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const saveTransaction = async (transaction: SamTransaction) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(transaction),
    })
  }

  const updateTransaction = async (transaction: Partial<ProposedTransaction>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction.id}`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(transaction),
    })
  }

  const removeTransaction = async (transaction: Pick<ProposedTransaction, 'id'>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions?id=eq.${transaction.id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })
  }


  const fetchTransactionByParam = async (param: TransactionParams, value: string) => {
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
    transactions,
    isLoading,
    get: {all: fetchTransactions, byParam: fetchTransactionByParam},
    saveTransaction,
    updateTransaction,
    removeTransaction
  }
}
