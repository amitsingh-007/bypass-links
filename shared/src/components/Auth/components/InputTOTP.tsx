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
    const totp = event.target.value?.slice(0, TOTP_LENGTH);
    setTOTP(totp);
    if (totp?.length === TOTP_LENGTH) {
      setIsVerifying(true);
      await handleVerify(totp);
      setIsVerifying(false);
      setTOTP('');
    }
  };

  return (
    <TextInput
      data-autofocus
      maw={200}
      size="lg"
      type="number"
      onBlur={({ target }) => target.focus()}
      label="Enter TOTP"
      value={totp}
      onChange={handleTOTPChange}
      styles={{
        input: {
          paddingLeft: '16px',
          paddingRight: '16px',
          letterSpacing: '16px',
        },
        label: {
          fontSize: '15px',
        },
      }}
      disabled={isVerifying}
      rightSection={isVerifying ? <Loader variant="oval" size="xs" /> : null}
    />
  );
};

export default InputTOTP;
