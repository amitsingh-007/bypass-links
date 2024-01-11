import { useMediaQuery } from '@mantine/hooks';

const usePlatform = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return Boolean(isMobile);
};

export default usePlatform;
