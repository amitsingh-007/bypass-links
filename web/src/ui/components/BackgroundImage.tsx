import { Box } from '@mui/material';
import Image, { ImageProps } from 'next/image';

type Props = Pick<ImageProps, 'alt' | 'height'> & {
  src: string;
  children?: React.ReactNode;
};

const BackgroundImage = ({ src, alt, height, children }: Props) => {
  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          zIndex: 1,
          '> div': {
            zIndex: -1,
          },
        }}
      >
        <Image src={src} alt={alt} layout="fill" objectFit="fill" />
        <Box>{children}</Box>
      </Box>
    </>
  );
};

export default BackgroundImage;
