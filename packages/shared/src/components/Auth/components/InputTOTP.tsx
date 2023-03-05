import { Loader, TextInput } from '@mantine/core';
import { useState } from 'react';
import { TOTP_LENGTH } from '../constants';

const InputTOTP = ({
  handleVerify,
}: {
  handleVerify: (totp: string) => Promise<void>;
}) => {
  const [totp, setTOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleTOTPChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputTotp = event.target.value?.slice(0, TOTP_LENGTH);
    setTOTP(inputTotp);
    if (inputTotp?.length === TOTP_LENGTH) {
      setIsVerifying(true);
      await handleVerify(inputTotp);
      setIsVerifying(false);
      setTOTP('');
    }
  };

  return (
    <TextInput
      data-autofocus
      maw="12.5rem"
      size="lg"
      type="number"
      onBlur={({ target }) => target.focus()}
      label="Enter TOTP"
      value={totp}
      onChange={handleTOTPChange}
      styles={{
        input: {
          paddingLeft: '1rem',
          paddingRight: '1rem',
          letterSpacing: '1rem',
        },
        label: {
          fontSize: '0.9375rem',
        },
      }}
      disabled={isVerifying}
      rightSection={isVerifying ? <Loader variant="oval" size="xs" /> : null}
    />
  );
};

export default InputTOTP;
