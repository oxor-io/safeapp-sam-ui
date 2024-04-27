import { useEffect, useState } from 'react'

import { ProposedTransaction } from '../typings/models'

const REACT_APP_SUPABASE_URL = "https://snsoupmxxcbdyohaeeny.supabase.co"
const REACT_APP_SUPABASE_KEY= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc291cG14eGNiZHlvaGFlZW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM4OTM2MzEsImV4cCI6MjAyOTQ2OTYzMX0.v8BGP1LFm1siAYXC7QYobH9bJ0y-tnzVMCqJkhOF4Eg"

export interface ZkWallet {
  id: number
  owners: string[]
  root: string
  address: string
}

type ZkWalletParams = 'id' | 'root' | 'owners' | 'address'
export const useZkWallet = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [zkWallets, setZkWallets] = useState<ZkWallet[]>([])

  useEffect(() => {
    fetchZkWallets()
  }, [])

  const fetchZkWallets = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets`, {
        method: 'GET',
        headers: {
          "Content-Type": 'application/json',
          "apiKey": REACT_APP_SUPABASE_KEY ?? '',
          Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
        },
      })
      const json = await response.json()
      setZkWallets(json)
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  const saveZkWallet = async (zkWallet: Omit<ZkWallet, 'id'>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(zkWallet),
    })
  }

  const updateZkWallet = async (transaction: Partial<ZkWallet>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets?id=eq.${transaction.id}`, {
      method: 'UPDATE',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(transaction),
    })
  }

  const removeZkWallet = async (transaction: Pick<ProposedTransaction, 'id'>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets?id=eq.${transaction.id}`, {
      method: 'DELETE',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })
  }


  const fetchZkWalletByParam = async (param: ZkWalletParams, value: string) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets?${param}=eq.${value}&select=*`, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })
  }

  return {
    zkWallets,
    isLoading,
    get: {all: fetchZkWallets, byParam: fetchZkWalletByParam},
    saveZkWallet,
    updateZkWallet,
    removeZkWallet
  }
}
