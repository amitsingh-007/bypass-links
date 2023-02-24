import { useMediaQuery } from '@mantine/hooks';

const usePlatform = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return isMobile;
};

export default usePlatform;
