import { Flex, Loader, PinInput } from '@mantine/core';
import { useState } from 'react';
import { TOTP_LENGTH } from '../constants';

function InputTOTP({
  handleVerify,
}: {
  handleVerify: (totp: string) => Promise<void>;
}) {
  const [state, setState] = useState({ isVerifying: false, hasError: false });

  const handleTOTPChange = async (inputTotp: string) => {
    setState((prev) => ({ ...prev, hasError: false }));
    if (inputTotp?.length === TOTP_LENGTH) {
      setState((prev) => ({ ...prev, isVerifying: true }));
      await handleVerify(inputTotp);
      setState({ isVerifying: false, hasError: true });
    }
  };

  return (
    <Flex direction="column" gap="0.5rem">
      <Flex gap="0.5rem">
        Enter TOTP {state.isVerifying && <Loader variant="oval" size="xs" />}
      </Flex>
      <PinInput
        autoFocus
        length={6}
        type="number"
        disabled={state.isVerifying}
        error={state.hasError}
        onChange={handleTOTPChange}
      />
    </Flex>
  );
}

export default InputTOTP;
