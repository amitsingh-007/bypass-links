import { Box, Flex, Grid, Text } from '@mantine/core';
import CircleIcon from '@ui/icons/circle.svg';
import { memo } from 'react';
import Feature from 'src/ui/interfaces/feature';
import { firstColumn, secondColumn } from '../constants/features';

const Description = () => (
  <Box pos="relative" mb={40}>
    <Text fw={500} fz={31} component="span">
      Why{' '}
      <Text component="span" color="#7e67ff">
        Bypass Links
      </Text>
    </Text>
    <Box
      pos="absolute"
      top={30}
      right={105}
      w={140}
      sx={{ borderBottom: '30px solid rgba(106,80,255,.4)' }}
    />
    <Text mt={35} size="md">
      An easy to use links bypasser and highly customizable & multipurpose
      bookmarks panel with person tagging panel, website last visited feature
      and many more ...
    </Text>
    <Box pos="relative" top={18} right={110}>
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
        <Box key={title} mb={70}>
          <Icon height={35} width={35} />
          <Text fw="bold" fz="lg">
            {title}
          </Text>
          <Text fz="md" color="#839bad">
            {content}
          </Text>
        </Box>
      ))}
    </>
  );
};

const SalientFeatures = memo(function SalientFeatures() {
  return (
    <Flex mt={150}>
      <Grid>
        <Grid.Col md={5}>
          <Description />
        </Grid.Col>
        <Grid.Col md={3.5}>
          <FeaturesColumn columnData={firstColumn} />
        </Grid.Col>
        <Grid.Col md={3.5}>
          <FeaturesColumn columnData={secondColumn} />
        </Grid.Col>
      </Grid>
    </Flex>
  );
});

export default SalientFeatures;
