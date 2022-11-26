import { Box } from '@mui/material';
import Image, { ImageProps } from 'next/image';
import { CSSProperties } from 'react';

type Props = Pick<ImageProps, 'alt' | 'height'> & {
  src: string;
  children?: React.ReactNode;
  imageStyles?: CSSProperties;
};

const BackgroundImage = ({
  src,
  alt,
  height,
  children,
  imageStyles = {},
}: Props) => {
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
        <Image src={src} alt={alt} sizes="100%" fill style={imageStyles} />
        <Box>{children}</Box>
      </Box>
    </>
  );
};

export default BackgroundImage;
