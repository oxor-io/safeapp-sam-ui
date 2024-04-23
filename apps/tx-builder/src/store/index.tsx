import React from 'react'
import TransactionsProvider from './transactionsContext'
import TransactionLibraryProvider from './transactionLibraryContext'
import NetworkProvider from './networkContext'
import SamProvider from './samContext'

const StoreProvider: React.FC = ({ children }) => {
  return (
    <NetworkProvider>
      <SamProvider>
        <TransactionsProvider>
          <TransactionLibraryProvider>
            {children}
          </TransactionLibraryProvider>
        </TransactionsProvider>
      </SamProvider>
    </NetworkProvider>
  )
}

export { useTransactions } from './transactionsContext'
export { useTransactionLibrary } from './transactionLibraryContext'
export { useNetwork } from './networkContext'

export default StoreProvider
