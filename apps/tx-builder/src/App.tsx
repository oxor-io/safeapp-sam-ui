import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import ModuleConfiguration from './pages/ModuleConfiguration'
import Dashboard from './pages/Dashboard'
import ReviewAndConfirm from './pages/ReviewAndConfirm'
import TransactionLibrary from './pages/TransactionLibrary'
import Confirmed from './pages/Confirmed'
import {
  HOME_PATH,
  REVIEW_AND_CONFIRM_PATH,
  TRANSACTION_LIBRARY_PATH,
  DASHBOARD_PATH,
  CONFIRMED_PATH,
} from './routes/routes'

const App = () => {
  console.log(process.env)

  return (
    <>
      {/* App Header */}
      <Header />

      <Routes>
        <Route path={HOME_PATH} element={<ModuleConfiguration />} />

        {/* Dashboard Screen (Create transactions) */}
        <Route path={DASHBOARD_PATH} element={<Dashboard />}>
          {/* Transactions Batch section */}
          {/*<Route index element={<CreateTransactions />} />*/}

          {/* Save Batch section */}
          {/*<Route path={SAVE_BATCH_PATH} element={<SaveTransactionLibrary />} />*/}

          {/* Edit Batch section */}
          {/*<Route path={EDIT_BATCH_PATH} element={<EditTransactionLibrary />} />*/}
        </Route>

        {/* Review & Confirm Screen */}
        <Route path={REVIEW_AND_CONFIRM_PATH} element={<ReviewAndConfirm />} />

        <Route path={CONFIRMED_PATH} element={<Confirmed />} />

        {/* Transaction Library Screen */}
        <Route path={TRANSACTION_LIBRARY_PATH} element={<TransactionLibrary />} />
      </Routes>
    </>
  )
}

export default App
