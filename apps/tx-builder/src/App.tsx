import { Routes, Route } from 'react-router-dom'

import Header from './components/Header'
import ModuleConfiguration from './pages/ModuleConfiguration'
import CreateTransactions from './pages/CreateTransactions'
import Dashboard from './pages/Dashboard'
import EditTransactionLibrary from './pages/EditTransactionLibrary'
import ReviewAndConfirm from './pages/ReviewAndConfirm'
import SaveTransactionLibrary from './pages/SaveTransactionLibrary'
import TransactionLibrary from './pages/TransactionLibrary'
import {
  HOME_PATH,
  EDIT_BATCH_PATH,
  REVIEW_AND_CONFIRM_PATH,
  SAVE_BATCH_PATH,
  TRANSACTION_LIBRARY_PATH,
  DASHBOARD_PATH,
} from './routes/routes'
import {Type} from "hardhat/internal/hardhat-network/provider/filter";

const App = () => {
  const testConnectToBackend = async () => {
    //const data = { address_to: '0x', value: '1111', memory_data: {data: 'memory data'}, proofs: [{data: 'proof 1'}, {data: 'proof 2'}, {data: 'proof 3'}], operation: {data: 'operation data'} }

   /* return await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": process.env.REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_KEY ?? ''}`,
      },
      body: JSON.stringify(data),
    })*/

    const res =  await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/transactions`, {
      method: 'GET',
      headers: {
        "Content-Type": 'application/json',
        "apiKey": process.env.REACT_APP_SUPABASE_KEY ?? '',
        Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_KEY ?? ''}`,
      },
    })

    console.log(await res.json())

    return res

  }
  return (
    <>
      {/* App Header */}
      <Header />

      <div onClick={()=>testConnectToBackend()}>use Back</div>

      <Routes>
        <Route path={HOME_PATH} element={<ModuleConfiguration />} />

        {/* Dashboard Screen (Create transactions) */}
        <Route path={DASHBOARD_PATH} element={<Dashboard />}>
          {/* Transactions Batch section */}
          <Route index element={<CreateTransactions />} />

          {/* Save Batch section */}
          <Route path={SAVE_BATCH_PATH} element={<SaveTransactionLibrary />} />

          {/* Edit Batch section */}
          <Route path={EDIT_BATCH_PATH} element={<EditTransactionLibrary />} />
        </Route>

        {/* Review & Confirm Screen */}
        <Route path={REVIEW_AND_CONFIRM_PATH} element={<ReviewAndConfirm />} />

        {/* Transaction Library Screen */}
        <Route path={TRANSACTION_LIBRARY_PATH} element={<TransactionLibrary />} />
      </Routes>
    </>
  )
}

export default App
