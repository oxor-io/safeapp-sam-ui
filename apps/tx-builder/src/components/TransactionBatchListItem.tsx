import {
  Accordion,
  AccordionSummary,
  Button,
  Dot,
  EthHashInfo,
  Loader,
  Text,
  TextFieldInput,
} from '@gnosis.pm/safe-react-components'
import { AccordionDetails, IconButton } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { memo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd'
import styled from 'styled-components'
import { ProposedTransaction, SamTransaction } from '../typings/models'
import TransactionDetails from './TransactionDetails'
import { getTransactionText } from '../utils'
import { useCircomProof } from '../hooks/useCircomProof'
import { useGenerateCircuitInputs } from '../hooks/useGenerateCircuitInputs'
import { bigintToUint8ArrayBitwise } from '../scripts/common'
import { addHexPrefix } from "ethereumjs-util"
import { useTransaction } from '../hooks/useTransaction'
import { useSam } from '../store/samContext'
import { CONFIRMED_PATH } from '../routes/routes'

const UNKNOWN_POSITION_LABEL = '?'
const minArrowSize = '12'

type TransactionProps = {
  transaction: SamTransaction
  provided: DraggableProvided
  snapshot: DraggableStateSnapshot
  isLastTransaction: boolean
  showTransactionDetails: boolean
  index: number
  draggableTxIndexDestination: number | undefined
  draggableTxIndexOrigin: number | undefined
  reorderTransactions?: (sourceIndex: number, destinationIndex: number) => void
  networkPrefix: string | undefined
  replaceTransaction?: (newTransaction: ProposedTransaction, index: number) => void
  setTxIndexToEdit: (index: string) => void
  openEditTxModal: () => void
  removeTransaction?: (index: number) => void
  setTxIndexToRemove: (index: string) => void
  openDeleteTxModal: () => void
  onConfirmation?: () => void
}

const TransactionBatchListItem = memo(
  ({
    transaction,
    provided,
    snapshot,
    isLastTransaction,
    showTransactionDetails,
    index,
    draggableTxIndexDestination,
    draggableTxIndexOrigin,
    reorderTransactions,
    networkPrefix,
    onConfirmation,
  }: TransactionProps) => {
    const { description } = transaction
    const { to } = description

    const transactionDescription = getTransactionText(description)

    const [isTxExpanded, setTxExpanded] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)

    const [privateKey, setPrivateKey] = useState('')

    const onClickShowTransactionDetails = () => {
      if (showTransactionDetails) {
        setTxExpanded(isTxExpanded => !isTxExpanded)
      }
    }
    const isThisTxBeingDragging = snapshot.isDragging

    const showArrowAdornment = !isLastTransaction && !isThisTxBeingDragging

    // displayed order can change if the user uses the drag and drop feature
    const displayedTxPosition = getDisplayedTxPosition(
      index,
      isThisTxBeingDragging,
      draggableTxIndexDestination,
      draggableTxIndexOrigin,
    )

    const { zkProof, isLoading, generateCircomProof } = useCircomProof()
    const { generateInputs } = useGenerateCircuitInputs()
    const { updateTransactionById } = useTransaction()
    const { executeTransaction, setErrorMessage } = useSam()
    const navigate = useNavigate()

    const onConfirm = async () => {
      if (!!zkProof) {
        await updateTransactionById(
          transaction.id,
          {
            proofs: [
              ...transaction.proofs,
              zkProof,
            ]
          }
        )

        setIsConfirming(false)
        onConfirmation && onConfirmation()

        return
      }

      setIsConfirming(!isConfirming)
      setTxExpanded(true)
    }

    const onGenerateProof = async () => {
      const privateKeyHex = addHexPrefix(privateKey)
      const privateKeyUint8Array = bigintToUint8ArrayBitwise(BigInt(privateKeyHex))

      try {
        const witness = await generateInputs({
          participantAddresses: transaction.owners,
          privKey: privateKeyUint8Array,
          msgHash: transaction.msgHash,
        })

        await generateCircomProof(witness)
      } catch(e) {
        if (e instanceof Error) {
          setErrorMessage(e.message)
        }
      }
    }

    const onExecute = async () => {
      const { raw: {to, value, data}, operation, proofs} = transaction

      await executeTransaction(
        transaction.id,
        transaction.address,
        {
          to,
          value,
          data,
          operation,
          proofs,
        }
      )

      navigate(CONFIRMED_PATH)
    }

    const confirmButtonDisabled = isLoading || transaction.proofs.length === transaction.threshold || (isConfirming && !zkProof)

    return (
      <TransactionListItem ref={provided.innerRef} {...provided.draggableProps}>
        {/* Transacion Position */}
        <PositionWrapper>
          <PositionDot color="tag" isDragging={isThisTxBeingDragging}>
            <Text size="xl">{displayedTxPosition}</Text>
          </PositionDot>
          {showArrowAdornment && <ArrowAdornment />}
        </PositionWrapper>

        {/* Transaction Description */}
        <StyledAccordion
          expanded={isTxExpanded}
          compact
          onChange={onClickShowTransactionDetails}
          isDragging={isThisTxBeingDragging}
          TransitionProps={{ unmountOnExit: true }}
        >
          <div {...provided.dragHandleProps}>
            <AccordionSummary
              expandIcon={false}
              style={{ cursor: reorderTransactions ? 'grab' : 'pointer' }}
            >
              { !isConfirming ? (
                <>
                  {/* Destination Address label */}
                  <EthHashInfo
                    shortName={networkPrefix || ''}
                    hash={to}
                    shortenHash={4}
                    shouldShowShortName
                  />

                  {/* Transaction Description label */}
                  <TransactionsDescription size="lg">{transactionDescription}</TransactionsDescription>
                </>
              ) : (
                <>
                  <TextFieldInput
                    fullWidth
                    color="secondary"
                    size="small"
                    name="private-key"
                    label="Private key"
                    autoComplete="off"
                    style={{ minHeight: 'initial', marginRight: '10px' }}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{width: '30px', height: '34px', flexShrink: 0}}>
                    {isLoading && (
                      <Loader
                        color="secondary"
                        size="sm"
                      />
                    )}
                  </div>
                  <Button
                    onClick={async (e) => {
                      e.stopPropagation()

                      await onGenerateProof()
                    }}
                    size="md"
                    color="secondary"
                    disabled={isLoading}
                    style={{
                      fontSize: '12px', padding: '0 10px',
                      margin: '0 10px', minWidth: '110px',
                    }}
                  >
                    Generate proof
                  </Button>
                </>
              )}

              {/* Transaction Actions */}

              {!transaction.confirmed && (
                <>
                  <Button
                    style={{ fontSize: '12px', padding: '0 10px', width: '80px', minWidth: 'initial' }}
                    size="md"
                    variant="bordered"
                    color="primary"
                    disabled={confirmButtonDisabled}
                    onClick={async (event: any) => {
                      event.stopPropagation()

                      await onConfirm()
                    }}
                  >
                    Confirm
                  </Button>


                  {!isConfirming ? (
                    <Button
                      style={{ fontSize: '12px', minWidth: '80px',  marginLeft: '10px', padding: '0 10px' }}
                      size="md"
                      variant="bordered"
                      color="secondary"
                      disabled={transaction.proofs.length < transaction.threshold}
                      onClick={async (event: any) => {
                        event.stopPropagation()
                        await onExecute()
                      }}
                    >
                      Execute
                    </Button>
                  ) : (
                    <IconButton
                      style={{ marginLeft: '10px' }}
                      size="medium"
                      disabled={isLoading}
                      onClick={() => setIsConfirming(false)}
                    >
                      <Close />
                    </IconButton>
                  )}
                </>
              )}
            </AccordionSummary>
          </div>

          {/* Transaction details */}
          <AccordionDetails>
            <TransactionDetails transaction={transaction} />
          </AccordionDetails>
        </StyledAccordion>
      </TransactionListItem>
    )
  },
)

const getDisplayedTxPosition = (
  index: number,
  isDraggingThisTx: boolean,
  draggableTxIndexDestination?: number,
  draggableTxIndexOrigin?: number,
): string => {
  // we show the correct position in the transaction that is being dragged
  if (isDraggingThisTx) {
    const isAwayFromDroppableZone = draggableTxIndexDestination === undefined
    return isAwayFromDroppableZone
      ? UNKNOWN_POSITION_LABEL
      : String(draggableTxIndexDestination + 1)
  }

  // if a transaction is being dragged, we show the correct position in previous transactions
  if (index < Number(draggableTxIndexOrigin)) {
    // depending on the current destination we show the correct position
    return index >= Number(draggableTxIndexDestination) ? `${index + 2}` : `${index + 1}`
  }

  // if a transaction is being dragged, we show the correct position in next transactions
  if (index > Number(draggableTxIndexOrigin)) {
    // depending on the current destination we show the correct position
    return index > Number(draggableTxIndexDestination) ? `${index + 1}` : `${index}`
  }

  // otherwise we show the natural position
  return `${index + 1}`
}

const TransactionListItem = styled.li`
  display: flex;
  margin-bottom: 8px;
`

// transaction postion dot styles

const PositionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 10px 0 0;
`

const PositionDot = styled(Dot).withConfig({
  shouldForwardProp: (prop, defaultValidatorFn) => defaultValidatorFn(prop),
})<{ isDragging: boolean }>`
  height: 24px;
  width: 24px;
  min-width: 24px;
  background-color: ${({ isDragging }) => (isDragging ? '#92c9be' : ' #e2e3e3')};
  transition: background-color 0.5s linear;
`

const ArrowAdornment = styled.div`
  position: relative;
  border-left: 1px solid #e2e3e3;
  flex-grow: 1;
  margin-top: 8px;

  &&::before {
    content: ' ';
    display: inline-block;
    position: absolute;
    border-left: 1px solid #e2e3e3;

    height: ${minArrowSize}px;
    bottom: -${minArrowSize}px;
    left: -1px;
  }

  &&::after {
    content: ' ';
    display: inline-block;
    position: absolute;
    bottom: -${minArrowSize}px;
    left: -4px;

    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: #e2e3e3;
    padding: 3px;

    transform: rotate(45deg);
  }
`

// transaction description styles

const StyledAccordion = styled(Accordion).withConfig({
  shouldForwardProp: prop => !['isDragging'].includes(prop),
})<{ isDragging: boolean }>`
  flex-grow: 1;

  &.MuiAccordion-root {
    margin-bottom: 0;
    border-color: ${({ isDragging, expanded }) => (isDragging || expanded ? '#92c9be' : '#e8e7e6')};
    transition: border-color 0.5s linear;
  }

  .MuiAccordionSummary-root {
    height: 52px;
    padding: 0px 8px;
    background-color: ${({ isDragging }) => (isDragging ? '#EFFAF8' : '#FFFFFF')};

    &:hover {
      background-color: #ffffff;
    }

    .MuiIconButton-root {
      padding: 8px;
    }

    &.Mui-expanded {
      background-color: #effaf8;
      border-color: ${({ isDragging, expanded }) =>
        isDragging || expanded ? '#92c9be' : '#e8e7e6'};
    }
  }

  .MuiAccordionSummary-content {
    max-width: 100%;
    align-items: center;
  }
`

const TransactionsDescription = styled(Text)`
  flex-grow: 1;
  padding-left: 24px;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default TransactionBatchListItem
