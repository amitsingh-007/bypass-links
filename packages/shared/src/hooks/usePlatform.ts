import { useResponsive } from 'ahooks';

const usePlatform = () => {
  const responsive = useResponsive();
  const isMobile = !responsive?.md;

  return Boolean(isMobile);
};

export default usePlatform;
