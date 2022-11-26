import useDevice from '@/ui/hooks/useDevice';
import {
  Box,
  IconButton,
  SvgIcon,
  SvgIconProps,
  Typography,
} from '@mui/material';
import { GoMarkGithub } from 'react-icons/go';
import { MdExtension } from 'react-icons/md';
import { RiTimeFill } from 'react-icons/ri';
import BackgroundImage from 'src/ui/components/BackgroundImage';

const Info = ({
  icon: Icon,
  text,
}: {
  icon: React.FC<SvgIconProps>;
  text: string;
}) => {
  const isDesktop = useDevice();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: isDesktop ? '10px' : 0,
      }}
    >
      <SvgIcon fontSize="medium">
        <Icon />
      </SvgIcon>
      <Typography sx={{ ml: '10px', fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
};

const Footer = () => {
  const isDesktop = useDevice();

  return (
    <Box sx={{ mt: '100px' }}>
      <BackgroundImage
        src="/footer.png"
        alt="footer image"
        height={isDesktop ? 300 : 130}
        imageStyles={{ transform: `scale(${isDesktop ? 1 : 1.3})` }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            px: isDesktop ? '200px' : '10px',
            position: 'absolute',
            bottom: isDesktop ? '7%' : '-10px',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', zIndex: 1 }}>
            <Info icon={MdExtension} text={`v ${__EXT_VERSION__}`} />
            <Info icon={RiTimeFill} text={__RELEASE_DATE__} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              component="a"
              target="_blank"
              href="https://github.com/amitsingh-007/bypass-links"
              title="Bypass Links Github Page"
            >
              <IconButton size="large">
                <GoMarkGithub />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </BackgroundImage>
    </Box>
  );
};

export default Footer;
