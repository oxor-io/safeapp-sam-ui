import { Title, Button } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

import { ContractInterface } from '../../typings/models'
import { isValidAddress } from '../../utils'
import SolidityForm, {
  CONTRACT_METHOD_INDEX_FIELD_NAME,
  SolidityFormValuesTypes,
  TO_ADDRESS_FIELD_NAME,
} from './SolidityForm'
import { useNetwork } from '../../store'

type AddNewTransactionFormProps = {
  contract: ContractInterface | null
  to: string
  showHexEncodedData: boolean
  onSubmit: (values: SolidityFormValuesTypes) => void
}

const AddNewTransactionForm = ({
  contract,
  to,
  showHexEncodedData,
  onSubmit,
}: AddNewTransactionFormProps) => {
  const initialFormValues = {
    [TO_ADDRESS_FIELD_NAME]: isValidAddress(to) ? to : '',
    [CONTRACT_METHOD_INDEX_FIELD_NAME]: '0',
  }

  const { networkPrefix, getAddressFromDomain, nativeCurrencySymbol } = useNetwork()

  return (
    <>
      <Title size="xs">Transaction information</Title>

      <SolidityForm
        id="solidity-contract-form"
        initialValues={initialFormValues}
        contract={contract}
        getAddressFromDomain={getAddressFromDomain}
        nativeCurrencySymbol={nativeCurrencySymbol}
        networkPrefix={networkPrefix}
        onSubmit={onSubmit}
        showHexEncodedData={showHexEncodedData}
      >
        <ButtonContainer>
          {/* Add transaction btn */}
          <Button size="md" color="secondary" type="submit">
            Generate Proof
          </Button>
        </ButtonContainer>
      </SolidityForm>
    </>
  )
}

export default AddNewTransactionForm

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`
