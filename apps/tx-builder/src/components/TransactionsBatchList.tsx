import { isValidElement, useMemo, useState } from 'react'
import { Dot, Title } from '@gnosis.pm/safe-react-components'

import IconButton from '@material-ui/core/IconButton'
import styled from 'styled-components'
import {
  DragDropContext,
  Droppable,
  DroppableProvided,
  DragStart,
  DragUpdate,
  DropResult,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'
import { ProposedTransaction, SamTransaction } from '../typings/models'
import useModal from '../hooks/useModal/useModal'
import DeleteTransactionModal from './modals/DeleteTransactionModal'
import DeleteBatchModal from './modals/DeleteBatchModal'
import SaveBatchModal from './modals/SaveBatchModal'
import EditTransactionModal from './modals/EditTransactionModal'
import { useNetwork } from '../store'
import Item from './TransactionBatchListItem'
import { getTransactionText } from '../utils'
import { EditableLabelProps } from './EditableLabel'

type TransactionsBatchListProps = {
  transactions: SamTransaction[]
  showTransactionDetails: boolean
  showBatchHeader: boolean
  // batch title has multiple types because there are files passing it as a string
  // or 2 types of components:
  // 1: apps/tx-builder/src/pages/EditTransactionLibrary.tsx
  // 2: apps/tx-builder/src/pages/CreateTransactions.tsx
  batchTitle?:
    | string
    | React.ReactElement<EditableLabelProps>
    | React.ReactElement<{ filename: string }>
  removeTransaction?: (index: number) => void
  saveBatch?: (name: string, transactions: ProposedTransaction[]) => void
  downloadBatch?: (name: string, transactions: ProposedTransaction[]) => void
  removeAllTransactions?: () => void
  replaceTransaction?: (newTransaction: ProposedTransaction, index: number) => void
  reorderTransactions?: (sourceIndex: number, destinationIndex: number) => void
  onConfirmation?: () => void
}

const TRANSACTION_LIST_DROPPABLE_ID = 'Transaction_List'
const DROP_EVENT = 'DROP'

const TransactionsBatchList = ({
  transactions,
  reorderTransactions,
  removeTransaction,
  removeAllTransactions,
  replaceTransaction,
  saveBatch,
  showTransactionDetails,
  batchTitle,
  onConfirmation,
}: TransactionsBatchListProps) => {
  const [draggableTxIndexOrigin, setDraggableTxIndexOrigin] = useState<number>()
  const [draggableTxIndexDestination, setDraggableTxIndexDestination] = useState<number>()

  const { networkPrefix, getAddressFromDomain, nativeCurrencySymbol } = useNetwork()

  const onDragStart = ({ source }: DragStart) => {
    setDraggableTxIndexOrigin(source.index)
    setDraggableTxIndexDestination(source.index)
  }

  const onDragUpdate = ({ source, destination }: DragUpdate) => {
    setDraggableTxIndexOrigin(source.index)
    setDraggableTxIndexDestination(destination?.index)
  }

  // we only perform the reorder if its present
  const onDragEnd = ({ reason, source, destination }: DropResult) => {
    const sourceIndex = source.index
    const destinationIndex = destination?.index

    const isDropEvent = reason === DROP_EVENT // because user can cancel the drag & drop
    const hasTxPositionChanged = sourceIndex !== destinationIndex && destinationIndex !== undefined

    const shouldPerformTxReorder = isDropEvent && hasTxPositionChanged

    if (shouldPerformTxReorder) {
      reorderTransactions?.(sourceIndex, destinationIndex)
    }

    setDraggableTxIndexOrigin(undefined)
    setDraggableTxIndexDestination(undefined)
  }

  // 5 modals needed: save batch modal, edit transaction modal, delete batch modal, delete transaction modal, download batch modal
  const {
    open: showDeleteBatchModal,
    openModal: openClearTransactions,
    closeModal: closeDeleteBatchModal,
  } = useModal()
  const {
    open: showSaveBatchModal,
    openModal: openSaveBatchModal,
    closeModal: closeSaveBatchModal,
  } = useModal()
  const {
    open: showDeleteTxModal,
    openModal: openDeleteTxModal,
    closeModal: closeDeleteTxModal,
  } = useModal()
  const {
    open: showEditTxModal,
    openModal: openEditTxModal,
    closeModal: closeEditTxModal,
  } = useModal()

  const [txIndexToRemove, setTxIndexToRemove] = useState<string>()
  const [txIndexToEdit, setTxIndexToEdit] = useState<string>()

  const fileName = useMemo(() => {
    if (isValidElement(batchTitle)) {
      if ('filename' in batchTitle.props) {
        return batchTitle.props.filename
      } else if (batchTitle.props.children) {
        return batchTitle.props.children.toString()
      }

      return 'Untitled'
    }

    return batchTitle || 'Untitled'
  }, [batchTitle])

  return (
    <>
      <TransactionsBatchWrapper>
        {/* Standard Transactions List */}
          <DragDropContext
            onDragStart={onDragStart}
            onDragUpdate={onDragUpdate}
            onDragEnd={onDragEnd}
          >
            <Droppable mode={'standard'} droppableId={TRANSACTION_LIST_DROPPABLE_ID}>
              {(provided: DroppableProvided) => (
                <TransactionList {...provided.droppableProps} ref={provided.innerRef}>
                  {transactions.map((transaction, index: number) => (
                    <Draggable
                      key={transaction.id}
                      index={index}
                      draggableId={transaction.id.toString()}
                      isDragDisabled={true}
                    >
                      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <Item
                          key={transaction.id}
                          transaction={transaction}
                          provided={provided}
                          snapshot={snapshot}
                          isLastTransaction={index === transactions.length - 1}
                          showTransactionDetails={showTransactionDetails}
                          index={index}
                          draggableTxIndexDestination={draggableTxIndexDestination}
                          draggableTxIndexOrigin={draggableTxIndexOrigin}
                          reorderTransactions={reorderTransactions}
                          networkPrefix={networkPrefix}
                          replaceTransaction={replaceTransaction}
                          setTxIndexToEdit={setTxIndexToEdit}
                          openEditTxModal={openEditTxModal}
                          removeTransaction={removeTransaction}
                          setTxIndexToRemove={setTxIndexToRemove}
                          openDeleteTxModal={openDeleteTxModal}
                          onConfirmation={onConfirmation}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TransactionList>
              )}
            </Droppable>
          </DragDropContext>
      </TransactionsBatchWrapper>

      {/* Edit transaction modal */}
      {showEditTxModal && (
        <EditTransactionModal
          txIndex={Number(txIndexToEdit)}
          transaction={transactions[Number(txIndexToEdit)]}
          onSubmit={(updatedTransaction: ProposedTransaction) => {
            closeEditTxModal()
            replaceTransaction?.(updatedTransaction, Number(txIndexToEdit))
          }}
          onDeleteTx={() => {
            closeEditTxModal()
            removeTransaction?.(Number(txIndexToEdit))
          }}
          onClose={closeEditTxModal}
          networkPrefix={networkPrefix}
          getAddressFromDomain={getAddressFromDomain}
          nativeCurrencySymbol={nativeCurrencySymbol}
        />
      )}

      {/* Delete batch modal */}
      {showDeleteBatchModal && removeAllTransactions && (
        <DeleteBatchModal
          count={transactions.length}
          onClick={() => {
            closeDeleteBatchModal()
            removeAllTransactions()
          }}
          onClose={closeDeleteBatchModal}
        />
      )}

      {/* Delete a transaction modal */}
      {showDeleteTxModal && (
        <DeleteTransactionModal
          txIndex={Number(txIndexToRemove)}
          txDescription={getTransactionText(transactions[Number(txIndexToRemove)]?.description)}
          onClick={() => {
            closeDeleteTxModal()
            removeTransaction?.(Number(txIndexToRemove))
          }}
          onClose={closeDeleteTxModal}
        />
      )}

      {/* Save batch modal */}
      {showSaveBatchModal && (
        <SaveBatchModal
          onClick={(name: string) => {
            closeSaveBatchModal()
            saveBatch?.(name, transactions)
          }}
          onClose={closeSaveBatchModal}
        />
      )}
    </>
  )
}

export default TransactionsBatchList

// tx positions can change during drag & drop

const TransactionsBatchWrapper = styled.section`
  width: 100%;
  user-select: none;
`

// batch header styles

const TransactionHeader = styled.header`
  margin-top: 24px;
  display: flex;
  align-items: center;
`

const TransactionCounterDot = styled(Dot)`
  height: 24px;
  width: 24px;
  min-width: 24px;
  background-color: #566976;
`

const TransactionsTitle = styled(Title)`
  flex-grow: 1;
  margin-left: 14px;
  min-width: 0;

  font-size: 16px;
  line-height: normal;
  display: flex;
  align-items: center;
`

const StyledHeaderIconButton = styled(IconButton)`
  &.MuiIconButton-root {
    border-radius: 4px;
    background-color: white;
    margin-left: 8px;
  }
`

// transactions list styles

const TransactionList = styled.ol`
  list-style: none;
  padding: 0;
`
