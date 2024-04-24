import { FC } from 'react'

import { Button, TextFieldInput, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

interface ComponentProps {
  proof: string
  onSaveTransaction: () => void
}

const ZkProofWindow: FC<ComponentProps> = ({proof, onSaveTransaction}) => {
  return (
    <Wrapper>
      <StyledTitle size="lg">
        ZK Proof
      </StyledTitle>

      <StyledTextFieldInput
        name="proof"
        label="Proof"
        fullWidth
        minRows={7}
        value={proof}
        variant="filled"
        multiline
      />

      <Button
        onClick={onSaveTransaction}
        fullWidth
        size="lg"
        color="primary"
        disabled={!proof}
        variant="bordered"
        style={{ marginTop: '2em' }}
      >
        Save
      </Button>
    </Wrapper>
  )
}

export default ZkProofWindow

const Wrapper = styled.div`
  padding: 2rem 1.5rem;
  flex: 1;
`

const StyledTitle = styled(Title)`
  margin-top: 0;
  margin-bottom: 0.5em;
`

const StyledTextFieldInput = styled(TextFieldInput)`
`
