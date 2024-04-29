import { useEffect } from 'react'
import {
  Title,
  Loader,
} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import TransactionsBatchList from '../components/TransactionsBatchList'
import { useNetwork } from '../store'
import { useTransaction } from '../hooks/useTransaction'
import { useZkWallet } from '../hooks/useZkWallet'

const ReviewAndConfirm = () => {
  const { safe } = useNetwork()
  const { zkWallets} = useZkWallet()
  const { transactions, isLoading, get} = useTransaction()

  useEffect(() => {
    if (!zkWallets.length) {
      return
    }

    get.all()
  }, [zkWallets, safe.owners])

  const pendingTransactions = transactions
    .filter((tx) => !tx.confirmed && tx.owners.includes(safe.owners[0]))

  return (
    <Wrapper>
      <StyledTitle size="xl">Review and Confirm</StyledTitle>

      { !isLoading ?
        pendingTransactions.length > 0 && (
          <TransactionsBatchList
            batchTitle={'Transactions Batch'}
            transactions={pendingTransactions}
            showTransactionDetails
            showBatchHeader
          />
        ) : (
          <Loader size="lg" color="secondary" />
      )}
    </Wrapper>
  )
}

export default ReviewAndConfirm

const Wrapper = styled.main`
  && {
    padding: 120px 48px 48px;
    max-width: 750px;
    margin: 0 auto;
  }
`

const StyledTitle = styled(Title)`
  margin-top: 0px;
  margin-bottom: 5px;
  font-size: 20px;
  line-height: normal;
`
