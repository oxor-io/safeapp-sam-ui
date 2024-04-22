import { useState } from 'react'

import { Button, TextFieldInput, Title } from '@gnosis.pm/safe-react-components'
import styled from 'styled-components'

const ZkProofWindow = () => {
  const [proof, setProof] = useState('')

  const handleSafe = () => {
    console.log('Proof saved!')
  }

  return (
    <Wrapper>
      <Content>
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
          onChange={(event) => setProof(event.target.value)}
          multiline
        />

        <Button
          onClick={handleSafe}
          fullWidth
          size="lg"
          color="secondary"
          variant="bordered"
        >
          Save
        </Button>
      </Content>
    </Wrapper>
  )
}

export default ZkProofWindow

const Wrapper = styled.div`
  padding: 2rem 0;
  width: 100%;

`

const Content = styled.div`
  max-width: 600px;
`

const StyledTitle = styled(Title)`
  margin-top: 0;
  margin-bottom: 0.5em;
`

const StyledTextFieldInput = styled(TextFieldInput)`
  margin-bottom: 2em;
`
