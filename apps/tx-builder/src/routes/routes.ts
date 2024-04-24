export const HOME_PATH = '/'

export const DASHBOARD_PATH = '/dashboard'
export const CREATE_BATCH_PATH = `${DASHBOARD_PATH}/create-batch`
export const BATCH_PATH = `${DASHBOARD_PATH}/batch`
export const SAVE_BATCH_PATH = BATCH_PATH
export const EDIT_BATCH_PATH = `${BATCH_PATH}/:batchId`

export const REVIEW_AND_CONFIRM_PATH = '/review-and-confirm'
export const CONFIRMED_PATH = '/confirmed'

export const TRANSACTION_LIBRARY_PATH = '/transaction-library'

export const getEditBatchUrl = (batchId: string | number) => {
  return `${BATCH_PATH}/${batchId}`
}
