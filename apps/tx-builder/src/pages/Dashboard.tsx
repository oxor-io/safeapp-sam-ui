import { ReactElement, useCallback, useEffect, useState } from 'react'
import { AddressInput, Divider, Switch, Text, TextField, TextFieldInput, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'
import InputAdornment from '@material-ui/core/InputAdornment'
import Grid from '@material-ui/core/Grid'
import CheckCircle from '@material-ui/icons/CheckCircle'
import detectProxyTarget from 'evm-proxy-detection'

import { evalTemplate, FETCH_STATUS, isValidAddress } from '../utils'
import AddNewTransactionForm from '../components/forms/AddNewTransactionForm'
import JsonField from '../components/forms/fields/JsonField'
import { ContractInterface } from '../typings/models'
import { useNetwork } from '../store'
import { useAbi } from '../hooks/useAbi'
import { useCircomProof } from '../hooks/useCircomProof'
import { useTransaction } from '../hooks/useTransaction'
import { useGenerateCircuitInputs, WitnessData } from '../hooks/useGenerateCircuitInputs'
import { ImplementationABIDialog } from '../components/modals/ImplementationABIDialog'
import ZkProofWindow from '../components/ZkProofWindow'
import { parseFormToProposedTransaction, SolidityFormValuesTypes } from '../components/forms/SolidityForm'
import { useNavigate } from 'react-router-dom'
import { ProposedTransaction } from '../typings/models'
import { REVIEW_AND_CONFIRM_PATH } from '../routes/routes'

const Dashboard = (): ReactElement => {
  const [abiAddress, setAbiAddress] = useState('')
  const [transactionRecipientAddress, setTransactionRecipientAddress] = useState('')
  const [contract, setContract] = useState<ContractInterface | null>(null)
  const [privateKey, setPrivateKey] = useState<string>('')
  const [showHexEncodedData, setShowHexEncodedData] = useState<boolean>(false)
  const [proposedTransaction, setProposedTransaction] = useState<ProposedTransaction | null>()
  const { abi, abiStatus, setAbi } = useAbi(abiAddress)
  const [implementationABIDialog, setImplementationABIDialog] = useState({
    open: false,
    implementationAddress: '',
    proxyAddress: '',
  })

  const {
    interfaceRepo,
    networkPrefix,
    getAddressFromDomain,
    web3,
    chainInfo,
    nativeCurrencySymbol,
  } = useNetwork()
  const navigate = useNavigate()

  const { saveTransaction, removeTransaction, updateTransaction } = useTransaction()
  const { generateInputs } = useGenerateCircuitInputs()
  const { zkProof, generateCircomProof, isLoading } = useCircomProof()

  useEffect(() => {
    if (!abi || !interfaceRepo) {
      setContract(null)
      return
    }

    setContract(interfaceRepo.getMethods(abi))
  }, [abi, interfaceRepo])

  const isAbiAddressInputFieldValid = !abiAddress || isValidAddress(abiAddress)

  const contractHasMethods =
    abiStatus === FETCH_STATUS.SUCCESS && contract && contract.methods.length > 0

  const isTransferTransaction =
    abiStatus === FETCH_STATUS.SUCCESS && isAbiAddressInputFieldValid && !abi
  const isContractInteractionTransaction =
    (abiStatus === FETCH_STATUS.SUCCESS || abiStatus === FETCH_STATUS.NOT_ASKED) && abi && contract

  const showNewTransactionForm = isTransferTransaction || isContractInteractionTransaction

  const showNoPublicMethodsWarning = contract && contract.methods.length === 0

  const handleAbiAddressInput = useCallback(
    async (input: string) => {
      // For some reason the onchange handler is fired many times
      // Even if the value hasn't changed, we have to check if we already tried to fetch the ABI
      const alreadyExecuted = input.toLowerCase() === abiAddress.toLowerCase()
      if (alreadyExecuted) {
        return
      }

      if (isValidAddress(input) && web3?.currentProvider) {
        const implementationAddress = await detectProxyTarget(
          input,
          // @ts-expect-error currentProvider type is many providers and not all of them are compatible
          // with EIP-1193, but the one we use is compatible (safe-apps-provider)
          web3.currentProvider.request.bind(web3.currentProvider),
        )

        if (implementationAddress) {
          const showImplementationAbiDialog = await interfaceRepo?.abiExists(implementationAddress)

          if (showImplementationAbiDialog) {
            setImplementationABIDialog({
              open: true,
              implementationAddress,
              proxyAddress: input,
            })
            return
          }
        }
      }

      setAbiAddress(input)
      setTransactionRecipientAddress(input)
    },
    [abiAddress, interfaceRepo, web3],
  )

  const onGenerateProof = async (values: SolidityFormValuesTypes) => {
    const newProposedTransaction = parseFormToProposedTransaction(
      values,
      contract,
      nativeCurrencySymbol,
      networkPrefix,
    )
    setProposedTransaction(newProposedTransaction)

    const witness: WitnessData = {
      "root": "7378323513472991738372527896654445137493089583233093119951646841738120031371",
      "pathElements": [
      "9479145765164306604898661246306912585240247746526471519759854195178979516700",
      "10821577188404079746999828440545293402557390793255312676266883079953085672921",
      "10266675050323606453909836805900148358798034671050728166354968531595868722006",
      "8575350884931261137867066738147375482425232494266355398216179294178508866708",
      "18097266179879782427361438755277450939722755112152115227098348943187633376449"
      ],
      "pathIndices": [ 0, 0, 0, 0, 0 ],
      "msgHash": [
      "3824357094776532107",
      "9862228419744377792",
      "9936023898774552892",
      "1175434750703219840"
      ],
      "pubKey": [
      [
      "1906500004718046581",
      "9734560624431998397",
      "8840109498736861078",
      "9446391870127103306"
      ],
      [
      "11484740855056378533",
      "18069073250093961717",
      "17506526050819047786",
      "3839302312743495238"
      ]
      ],
      "r": [
      "7172061516677377732",
      "10775169412356130873",
      "7410888667223180419",
      "11766794500794155490"
      ],
      "s": [
      "6633852572993487515",
      "3163981371610810274",
      "16259418595119449128",
      "8198346849702919726"
      ]
    }

    await generateCircomProof(witness)

    // TODO
    // const circomData = generateInputs()
    // await generateCircomProof(circomData)
  }

  const onSaveTransaction = () => {
    // saveTransaction()

    navigate(REVIEW_AND_CONFIRM_PATH)
  }

  if (!chainInfo) {
    return <div />
  }

  return (
    <Wrapper>
      <Grid alignItems="flex-start" container justifyContent="space-between" spacing={6}>
        <AddNewTransactionFormWrapper item xs={12} md={6}>
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <StyledTitle size="lg">New Transaction</StyledTitle>
            </Grid>
            <Grid container item xs={6} alignItems="center" justifyContent="flex-end">
              <Grid item>
                <Switch
                  checked={showHexEncodedData}
                  onChange={() => setShowHexEncodedData(!showHexEncodedData)}
                />
              </Grid>
              <Grid item>
                <Text size="lg">Custom data</Text>
              </Grid>
            </Grid>
          </Grid>

          <StyledDivider/>

          {/* ABI Address Input */}
          <AddressInput
            id="address"
            name="address"
            label="Enter Address or ENS Name"
            hiddenLabel={false}
            address={abiAddress}
            fullWidth
            showNetworkPrefix={!!networkPrefix}
            networkPrefix={networkPrefix}
            error={isAbiAddressInputFieldValid ? '' : 'The address is not valid'}
            showLoadingSpinner={abiStatus === FETCH_STATUS.LOADING}
            showErrorsInTheLabel={false}
            getAddressFromDomain={getAddressFromDomain}
            onChangeAddress={handleAbiAddressInput}
            InputProps={{
              endAdornment: contractHasMethods && isValidAddress(abiAddress) && (
                <InputAdornment position="end">
                  <CheckIconAddressAdornment/>
                </InputAdornment>
              ),
            }}
          />

          {/* ABI Warning */}
          {abiStatus === FETCH_STATUS.ERROR && (
            <StyledWarningText color="warning" size="lg">
              No ABI found for this address
            </StyledWarningText>
          )}

          <JsonField id="abi" name="abi" label="Enter ABI" value={abi} onChange={setAbi}/>

          {/* No public methods Warning */}
          {showNoPublicMethodsWarning && (
            <StyledMethodWarning color="warning" size="lg">
              Contract ABI doesn't have any public methods.
            </StyledMethodWarning>
          )}

          <TextFieldInput
            fullWidth
            required
            style={{ marginTop: '25px' }}
            type="text"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            name="private-key"
            label="Private key"
          />

          {showNewTransactionForm && (
            <>
              <StyledDivider/>
              <AddNewTransactionForm
                contract={contract}
                to={transactionRecipientAddress}
                showHexEncodedData={showHexEncodedData}
                onSubmit={onGenerateProof}
              />
            </>
          )}
        </AddNewTransactionFormWrapper>

        <ZkProofWindow
          proof={zkProof}
          isLoading={isLoading}
          onSaveTransaction={onSaveTransaction}
        />
      </Grid>

      {implementationABIDialog.open && (
        <ImplementationABIDialog
          networkPrefix={networkPrefix}
          blockExplorerLink={evalTemplate(chainInfo.blockExplorerUriTemplate.address, {
            address: implementationABIDialog.implementationAddress,
          })}
          implementationAddress={implementationABIDialog.implementationAddress}
          onCancel={() => {
            setAbiAddress(implementationABIDialog.proxyAddress)
            setTransactionRecipientAddress(implementationABIDialog.proxyAddress)
            setImplementationABIDialog({ open: false, implementationAddress: '', proxyAddress: '' })
          }}
          onConfirm={() => {
            setAbiAddress(implementationABIDialog.implementationAddress)
            setTransactionRecipientAddress(implementationABIDialog.proxyAddress)
            setImplementationABIDialog({ open: false, implementationAddress: '', proxyAddress: '' })
          }}
        />
      )}
    </Wrapper>
  )
}

export default Dashboard

const Wrapper = styled.main`
  && {
    padding: 120px 48px 48px;
    max-width: 1024px;
    margin: 0 auto;
  }
`

const AddNewTransactionFormWrapper = styled(Grid)`
  border-radius: 8px;
  background-color: white;
`

const StyledTitle = styled(Title)`
  font-weight: bold;
  margin-top: 0px;
  margin-bottom: 5px;
  line-height: 22px;
  font-size: 16px;
`

const StyledMethodWarning = styled(Text)`
  margin-top: 8px;
`

const StyledDivider = styled(Divider)`
  margin: 16px -24px 32px -24px;
`

const StyledWarningText = styled(Text)`
  margin-top: -18px;
  margin-bottom: 14px;
`

const CheckIconAddressAdornment = styled(CheckCircle)`
  color: #03ae60;
  height: 20px;
`
