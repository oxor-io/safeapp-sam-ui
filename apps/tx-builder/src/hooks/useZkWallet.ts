import { useEffect, useState } from 'react'

const REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL ?? ""
const REACT_APP_SUPABASE_KEY= process.env.REACT_APP_SUPABASE_KEY ?? ""

export interface ZkWallet {
  id: number
  safeWallet: string
  owners: string[]
  root: string
  address: string
  enabled: boolean
}

type ZkWalletParams = keyof ZkWallet
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

  const updateZkWallet = async (address: string, data: Partial<Omit<ZkWallet, 'id'>>) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets?address=eq.${address}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(data),
    })
  }

  const removeZkWallet = async (address: string) => {
    return await fetch(`${REACT_APP_SUPABASE_URL}/rest/v1/zkWallets?address=eq.${address}`, {
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
