import {
  Loader,
  Title,
} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import { useTransactions } from '../store'
import useDBInteraction from '../hooks/useDBInteraction'

const Confirmed = () => {
  const { transactions, isLoading} = useDBInteraction()

  return (
    <>
      <Wrapper>
        <StyledTitle size="xl">Confirmed transactions</StyledTitle>

        { !isLoading ? (
          <></>
          //   { transactions.length > 0 && (
          //     <TransactionsBatchList
          //       batchTitle={'Transactions Batch'}
          //       transactions={transactions}
          //       removeTransaction={removeTransaction}
          //       saveBatch={saveBatch}
          //       downloadBatch={downloadBatch}
          //       reorderTransactions={reorderTransactions}
          //       replaceTransaction={replaceTransaction}
          //       showTransactionDetails
          //       showBatchHeader
          //     />
          //   )}
        ) : (
          <Loader size="lg" />
        )}
      </Wrapper>
    </>
  )
}

export default Confirmed

const Wrapper = styled.main`
  && {
    padding: 120px 48px 48px;
    max-width: 650px;
    margin: 0 auto;
  }
`

const StyledTitle = styled(Title)`
  margin-top: 0px;
  margin-bottom: 5px;
  font-size: 20px;
  line-height: normal;
`
