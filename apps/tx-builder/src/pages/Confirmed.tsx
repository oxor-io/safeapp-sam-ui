import { useEffect } from 'react'
import {
  Loader,
  Title,
} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import TransactionsBatchList from '../components/TransactionsBatchList'

import { useTransaction } from '../hooks/useTransaction'
import { useNetwork } from '../store'

const Confirmed = () => {
  const { transactions, isLoading, get} = useTransaction()
  const { safe } = useNetwork()

  useEffect(() => {
    setTimeout(() => get.all(), 2200)
  }, [])

  const confirmedTransactions = transactions.filter((tx) => tx.confirmed && tx.owners.some((owner) => safe.owners.includes(owner)))

  return (
    <Wrapper>
      <StyledTitle size="xl">Confirmed transactions</StyledTitle>

      { !isLoading ?
        confirmedTransactions.length > 0 && (
          <TransactionsBatchList
            batchTitle={'Transactions Batch'}
            transactions={confirmedTransactions}
            showTransactionDetails
            showBatchHeader
          />
        ) : (
        <Loader size="lg" color="secondary" />
      )}
    </Wrapper>
  )
}

export default Confirmed

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
