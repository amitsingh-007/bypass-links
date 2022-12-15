import {
  Box,
  IconButton,
  SvgIcon,
  SvgIconProps,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { GoMarkGithub } from 'react-icons/go';
import { MdExtension } from 'react-icons/md';
import { RiTimeFill } from 'react-icons/ri';
import footerImage from '@public/footer.png';
import { getFormattedDateTime } from '@/ui/utils';

const Info = ({
  icon: Icon,
  text,
}: {
  icon: React.FC<SvgIconProps>;
  text: string;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: { xs: 0, md: '10px' },
      }}
    >
      <SvgIcon sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
        <Icon />
      </SvgIcon>
      <Typography sx={{ ml: '10px', fontWeight: 500 }}>{text}</Typography>
    </Box>
  );
};

const Footer = ({
  releaseDate,
  extVersion,
  country,
}: {
  releaseDate: string;
  extVersion: string;
  country: string;
}) => {
  console.log(3, { releaseDate, extVersion, country });
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 130, md: 300 },
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
      }}
    >
      <Image
        src={footerImage}
        alt="footer image"
        style={{
          height: 'inherit',
          width: 'inherit',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          position: 'absolute',
          px: { xs: '20px', md: '200px' },
          bottom: { xs: '0', md: '7%' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Info icon={MdExtension} text={`v ${extVersion}`} />
          <Info
            icon={RiTimeFill}
            text={getFormattedDateTime(releaseDate, country)}
          />
          <span>{releaseDate}</span>
          <span>{country}</span>
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
    </Box>
  );
};

export default Footer;
