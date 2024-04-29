import { useState } from 'react'

import { SamTransaction } from '../typings/models'

const REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? ""
const REACT_APP_SUPABASE_KEY= process.env.REACT_APP_SUPABASE_KEY ?? ""

type TransactionParams = keyof SamTransaction

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<SamTransaction[]>([])

  const fetchTransactionsByParam = async (param: TransactionParams, value: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${REACT_APP_SUPABASE_URL }/rest/v1/transactions?${ param }=eq.${ value }&select=*`, {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "apiKey": REACT_APP_SUPABASE_KEY ?? '',
          Authorization: `Bearer ${ REACT_APP_SUPABASE_KEY ?? '' }`,
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

  const updateTransactionById = async (id: number, data: Partial<Omit<SamTransaction, 'id'>>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(data),
    })
  }

  const removeTransactionsOnRootChange = async (samAddress: string) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/transactions?address=eq.${samAddress}&confirmed=eq.false`, {
      method: 'DELETE',
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
    get: {all: fetchTransactions, byParam: fetchTransactionsByParam},
    saveTransaction,
    updateTransactionById,
    removeTransactionsOnRootChange,
  }
}
