import { Box, Button, Group, Title } from '@mantine/core';
import ChromeIcon from '@ui/icons/chrome.svg';
import { memo } from 'react';

const PageHeader = memo<{ downloadLink: string }>(({ downloadLink }) => (
  <Group mt="4.375rem" position="center" sx={{ flexDirection: 'column' }}>
    <Title fz={{ base: '2.1875rem', md: '2.8125rem' }} ta="center">
      Have a Link Bypasser and private Bookmarks Panel !
    </Title>
    <Box ta="center">
      <Button
        component="a"
        href={downloadLink}
        radius="xl"
        size="lg"
        leftIcon={<ChromeIcon height={22} width={22} />}
        tt="uppercase"
        fw="bold"
        variant="gradient"
        gradient={{ from: '#6850ff', to: '#a750ff', deg: 90 }}
        fz="1rem"
        data-test-attr="ext-download-button"
      >
        Download Now
      </Button>
    </Box>
  </Group>
));
PageHeader.displayName = 'PageHeader';

export default PageHeader;
