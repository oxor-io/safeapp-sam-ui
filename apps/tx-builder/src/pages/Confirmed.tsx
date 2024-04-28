import {
  Loader,
  Title,
} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import TransactionsBatchList from '../components/TransactionsBatchList'

import { useTransaction } from '../hooks/useTransaction'

const Confirmed = () => {
  const { transactions, isLoading} = useTransaction()
  const confirmedTransactions = transactions.filter((transaction) => transaction.confirmed)

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
