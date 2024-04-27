import { FC } from 'react'

import { Button, Text, Title } from '@gnosis.pm/safe-react-components'
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

      <StyledDiv>
        <Text size='lg'>
          {proof}
        </Text>
      </StyledDiv>

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

const StyledDiv = styled.div`
  width: 100%;
  box-sizing: border-box;
  min-height: 200px;
  padding: 10px;
  background-color: #929292;
  color: #000000;
  border-radius: 8px;
`
