import { useState, useEffect } from 'react'
import {
  Title,
  Loader,
} from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import TransactionsBatchList from '../components/TransactionsBatchList'
import { useNetwork } from '../store'
import { useTransaction } from '../hooks/useTransaction'
import { useZkWallet, ZkWallet } from '../hooks/useZkWallet'

const ReviewAndConfirm = () => {
  const { safe } = useNetwork()
  const { zkWallets} = useZkWallet()
  const { isLoading, transactions, get} = useTransaction()

  const [zkWallet, setZkWallet] = useState<ZkWallet | undefined>(undefined)

  useEffect(() => {
    if (!zkWallets.length) {
      return
    }

    const owner = safe.owners[0]

    const zkWallet = zkWallets.find((wallet) => {
      return wallet.owners.includes(owner)
    })
    setZkWallet(zkWallet)

    if (!zkWallet) {
      return
    }

    get.byParam('address', zkWallet.address).then()
  }, [zkWallets, safe.owners])

  return (
    <Wrapper>
      <StyledTitle size="xl">Review and Confirm</StyledTitle>

      { !isLoading ?
        transactions.length > 0 && (
          <TransactionsBatchList
            batchTitle={'Transactions Batch'}
            transactions={transactions}
            showTransactionDetails
            showBatchHeader
            zkWallet={zkWallet}
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
