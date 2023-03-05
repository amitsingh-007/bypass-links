import { Box, Flex, Grid, Text } from '@mantine/core';
import CircleIcon from '@ui/icons/circle.svg';
import { memo } from 'react';
import Feature from 'src/ui/interfaces/feature';
import { firstColumn, secondColumn } from '../constants/features';

const Description = () => (
  <Box pos="relative" mb="2.5rem">
    <Text fw={500} fz="2rem" component="span">
      Why{' '}
      <Text component="span" color="#7e67ff">
        Bypass Links
      </Text>
    </Text>
    <Box
      pos="absolute"
      top="1.875rem"
      right="6.5625rem"
      w="8.75rem"
      sx={{ borderBottom: '30px solid rgba(106,80,255,.4)' }}
    />
    <Text mt="2.33rem" size="md">
      An easy to use links bypasser and highly customizable & multipurpose
      bookmarks panel with person tagging panel, website last visited feature
      and many more ...
    </Text>
    <Box pos="relative" top="1.125rem" right="6.25rem">
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
        <Box key={title} mb="4.375rem">
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
    <Flex mt="9.375rem">
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
