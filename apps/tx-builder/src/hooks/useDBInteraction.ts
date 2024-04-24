import { useEffect, useState } from 'react'

import { ProposedTransaction } from '../typings/models'

const REACT_APP_SUPABASE_URL = "https://snsoupmxxcbdyohaeeny.supabase.co"
const REACT_APP_SUPABASE_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc291cG14eGNiZHlvaGFlZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTM2MzEsImV4cCI6MjAyOTQ2OTYzMX0.v8BGP1LFm1siAYXC7QYobH9bJ0y-tnzVMCqJkhOF4Eg"

const useDBInteraction = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState()

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

  const saveTransaction = async (transaction: ProposedTransaction) => {
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

  return {
    transactions,
    isLoading,
    saveTransaction,
  }
}

export default useDBInteraction
