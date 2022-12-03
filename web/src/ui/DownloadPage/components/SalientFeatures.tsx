import { Box, Grid, Typography } from '@mui/material';
import CircleIcon from '@ui/icons/circle.svg';
import Feature from 'src/ui/interfaces/feature';
import { memo } from 'react';
import { firstColumn, secondColumn } from '../constants/features';

const Description = () => (
  <Box sx={{ position: 'relative' }}>
    <Box sx={{ fontSize: '28px', fontWeight: '500' }}>
      Why
      <Box component="span" sx={{ color: '#7e67ff' }}>
        {' Bypass Links'}
      </Box>
    </Box>
    <Box
      sx={{
        position: 'absolute',
        top: '30px',
        right: '105px',
        width: '140px',
        borderBottom: '30px solid rgba(106,80,255,.4)',
      }}
    />
    <Box sx={{ mt: '35px' }}>
      An easy to use links bypasser and highly customizable & multipurpose
      bookmarks panel with person tagging panel, website last visited feature
      and many more ...
    </Box>
    <Box sx={{ position: 'relative', top: '18px', right: '110px' }}>
      <CircleIcon />
    </Box>
  </Box>
);

const FeaturesColumn = ({
  columnData,
}: {
  columnData: Feature[];
}): JSX.Element => {
  return (
    <>
      {columnData.map(({ title, content, icon: Icon }) => (
        <Box key={title}>
          <Icon height={35} width={35} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '19px',
              lineHeight: '23px',
              color: '#fff',
              mt: { xs: 0, md: '20px' },
              mb: '10px',
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '14px',
              lineHeight: '17px',
              color: '#839bad',
              mb: '56px',
            }}
          >
            {content}
          </Typography>
        </Box>
      ))}
    </>
  );
};

const SalientFeatures = memo(() => {
  return (
    <Box sx={{ display: 'flex', mt: '150px' }}>
      <Grid container spacing={[4, 12]}>
        <Grid item xs={12} md={5}>
          <Description />
        </Grid>
        <Grid item xs={12} md={3.5}>
          <FeaturesColumn columnData={firstColumn} />
        </Grid>
        <Grid item xs={12} md={3.5}>
          <FeaturesColumn columnData={secondColumn} />
        </Grid>
      </Grid>
    </Box>
  );
});
SalientFeatures.displayName = 'SalientFeatures';

export default SalientFeatures;
