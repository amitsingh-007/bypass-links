import { Box, Flex, Grid, GridCol, Text } from '@mantine/core';
import CircleIcon from '@app/icons/circle.svg';
import React from 'react';
import { firstColumn, secondColumn } from '../constants/features';
import styles from './styles/SalientFeatures.module.css';
import type Feature from './types/feature';

const Description = () => (
  <Box pos="relative" mb="2.5rem">
    <Text fw={500} fz="2rem" component="span">
      Why{' '}
      <Text component="span" c="#7e67ff" fz="inherit" fw="inherit">
        Bypass Links
      </Text>
    </Text>
    <Box
      pos="absolute"
      top="1.875rem"
      right="6.5625rem"
      w="8.75rem"
      className={styles.borderBox}
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
}): React.JSX.Element => {
  return (
    <>
      {columnData.map(({ title, content, icon: Icon }) => (
        <Box key={title} mb="4.375rem">
          <Icon height={35} width={35} />
          <Text fw="bold" fz="lg">
            {title}
          </Text>
          <Text fz="md" c="#839bad">
            {content}
          </Text>
        </Box>
      ))}
    </>
  );
};

const SalientFeatures = () => {
  return (
    <Flex mt="9.375rem">
      <Grid>
        <GridCol span={{ base: 12, sm: 5 }}>
          <Description />
        </GridCol>
        <GridCol span={{ base: 12, sm: 3.5 }}>
          <FeaturesColumn columnData={firstColumn} />
        </GridCol>
        <GridCol span={{ base: 12, sm: 3.5 }}>
          <FeaturesColumn columnData={secondColumn} />
        </GridCol>
      </Grid>
    </Flex>
  );
};

export default SalientFeatures;
