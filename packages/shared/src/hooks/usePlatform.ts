import { useMediaQuery } from '@mantine/hooks';

const usePlatform = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isMobile = !isDesktop;

  return isMobile;
};

export default usePlatform;
